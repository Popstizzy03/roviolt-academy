import crypto from "node:crypto";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { payments, processedDodoWebhooks } from "$lib/server/db/schema";
import { sendInngestEvent } from "$lib/inngest/client";
import {
	verifyLencoWebhook,
	parseLencoReference,
} from "$lib/server/payments/lenco";
import {
	verifyDodoWebhook,
	parseDodoMetadata,
} from "$lib/server/payments/dodo";
import { fulfillEnrollment } from "$lib/server/payments/orchestrator";
import { paymentStatusGateway } from "$lib/server/payments/payment-status-gateway";

type Provider = "lenco" | "dodo";

function getProvider(url: URL): Provider | null {
	const p = url.searchParams.get("provider");
	if (p === "lenco" || p === "dodo") return p;
	return null;
}

export const POST: RequestHandler = async ({ request, url }) => {
	const provider = getProvider(url);
	if (!provider) {
		throw error(
			400,
			"Invalid or missing provider parameter (must be 'lenco' or 'dodo')",
		);
	}

	const rawBody = await request.text();

	if (provider === "lenco") {
		const apiToken = env.LENCO_API_TOKEN;
		if (!apiToken) {
			throw error(500, "LENCO_API_TOKEN is not configured");
		}

		const signature = request.headers.get("x-lenco-signature");
		if (!verifyLencoWebhook(rawBody, signature, apiToken)) {
			throw error(401, "Invalid webhook signature");
		}

		const payload = JSON.parse(rawBody);
		const eventType: string = payload.event;
		const reference: string | undefined = payload.data?.reference;

		if (eventType === "collection.failed") {
			if (reference) {
				await db
					.update(payments)
					.set({ status: "failed" })
					.where(eq(payments.gatewayReference, reference));

				paymentStatusGateway.emit(reference, {
					event: "payment.failed",
					reference,
					reason: payload.data?.reasonForFailure || "Payment failed",
				});
			}
			return json({ received: true });
		}

		if (eventType === "collection.cancelled") {
			if (reference) {
				await db
					.update(payments)
					.set({ status: "cancelled" })
					.where(eq(payments.gatewayReference, reference));

				paymentStatusGateway.emit(reference, {
					event: "payment.cancelled",
					reference,
				});
			}
			return json({ received: true });
		}

		if (eventType !== "collection.successful") {
			return json({ received: true });
		}

		const amount: string | undefined = payload.data?.amount;
		const currency: string | undefined = payload.data?.currency;

		if (!reference || !amount || !currency) {
			throw error(400, "Missing required fields: reference, amount, currency");
		}

		const parsed = parseLencoReference(reference);
		if (!parsed) {
			throw error(400, "Invalid reference format");
		}

		const { userId, courseId } = parsed;

		try {
			const existingPayment = await db
				.select({ id: payments.id, status: payments.status })
				.from(payments)
				.where(eq(payments.gatewayReference, reference))
				.limit(1);

			const isExisting = existingPayment.length > 0;

			if (!isExisting) {
				await db
					.insert(payments)
					.values({
						id: crypto.randomUUID(),
						userId,
						courseId,
						gateway: "lenco",
						gatewayReference: reference,
						amount,
						currency,
						status: "pending",
						metadata: {},
					})
					.onConflictDoNothing();
			}

			await fulfillEnrollment(reference);

			await sendInngestEvent("payment/process.fulfillment", {
				reference,
				gateway: "lenco",
				userId,
				courseId,
			});

			paymentStatusGateway.emit(reference, {
				event: "payment.completed",
				reference,
			});

			return json({ status: "success" });
		} catch (err) {
			console.error("[webhook/lenco] Processing error:", err);
			throw error(500, "Internal processing error");
		}
	}

	if (provider === "dodo") {
		const webhookSecret = env.DODO_WEBHOOK_SECRET;
		if (!webhookSecret) {
			throw error(500, "DODO_WEBHOOK_SECRET is not configured");
		}

		const headers = {
			"webhook-id": request.headers.get("webhook-id"),
			"webhook-timestamp": request.headers.get("webhook-timestamp"),
			"webhook-signature": request.headers.get("webhook-signature"),
		};

		if (!verifyDodoWebhook(rawBody, headers, webhookSecret)) {
			throw error(401, "Invalid webhook signature");
		}

		const payload = JSON.parse(rawBody);
		const eventType: string = payload.type;

		if (eventType !== "payment.succeeded") {
			return json({ received: true });
		}

		const data = payload.data as Record<string, unknown>;
		const paymentId: string | undefined = data.payment_id as string | undefined;
		const gatewayReference = paymentId || `dodo-${crypto.randomUUID()}`;
		const amount: string | undefined = data.total_amount as string | undefined;
		const currency: string | undefined = data.currency as string | undefined;
		const customerEmail: string | undefined = (
			data.customer as Record<string, unknown> | undefined
		)?.email as string | undefined;
		const metadata = parseDodoMetadata(data);

		if (!amount || !currency) {
			throw error(400, "Missing required fields: amount, currency");
		}

		if (!metadata) {
			throw error(400, "Missing userId/courseId in payment metadata");
		}

		const { userId, courseId } = metadata;

		try {
			// Idempotency: record webhook-id so we never process this event twice
			const eventId = headers["webhook-id"];
			if (eventId) {
				try {
					await db.insert(processedDodoWebhooks).values({ id: eventId });
				} catch {
					return json({ received: true, status: "duplicate" });
				}
			}

			await db
				.insert(payments)
				.values({
					id: crypto.randomUUID(),
					userId,
					courseId,
					gateway: "dodo",
					gatewayReference,
					amount,
					currency,
					status: "pending",
					metadata: {},
				})
				.onConflictDoNothing();

			await fulfillEnrollment(gatewayReference);

			await sendInngestEvent("payment/process.fulfillment", {
				reference: gatewayReference,
				gateway: "dodo",
				userId,
				courseId,
				email: customerEmail,
			});

			return json({ status: "success" });
		} catch (err) {
			console.error("[webhook/dodo] Processing error:", err);
			throw error(500, "Internal processing error");
		}
	}

	throw error(400, "Unhandled provider");
};
