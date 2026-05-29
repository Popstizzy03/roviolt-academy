import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { payments, enrollments } from "$lib/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { verifyLencoPayment } from "$lib/server/payments/lenco-client";
import { sendInngestEvent } from "$lib/inngest/client";
import { paymentStatusGateway } from "$lib/server/payments/payment-status-gateway";

export const GET: RequestHandler = async ({ params }) => {
	const { reference } = params;

	if (!reference) {
		throw error(400, "Reference is required");
	}

	const paymentResult = await db
		.select()
		.from(payments)
		.where(eq(payments.gatewayReference, reference))
		.limit(1);

	const localPayment = paymentResult[0];
	if (!localPayment) {
		throw error(404, "Payment not found");
	}

	// If already in terminal state, return it
	if (
		localPayment.status === "completed" ||
		localPayment.status === "failed" ||
		localPayment.status === "refunded"
	) {
		const enrollment = await db
			.select({ id: enrollments.id })
			.from(enrollments)
			.where(
				and(
					eq(enrollments.userId, localPayment.userId),
					eq(enrollments.courseId, localPayment.courseId),
				),
			)
			.limit(1);

		return json({
			success: true,
			status:
				localPayment.status === "completed"
					? "successful"
					: localPayment.status,
			amount: Number(localPayment.amount),
			currency: localPayment.currency || "ZMW",
			enrolled: enrollment.length > 0,
		});
	}

	// Call Lenco API to verify
	try {
		const verification = await verifyLencoPayment(reference);

		if (!verification.status) {
			throw error(502, verification.message || "Lenco API error");
		}

		const lencoData = verification.data;
		const isSuccessful = lencoData?.status === "successful";
		const isPending =
			lencoData?.status === "pending" || lencoData?.status === "pay-offline";

		let paymentStatus: "completed" | "pending" | "failed";
		if (isSuccessful) {
			paymentStatus = "completed";
		} else if (isPending) {
			paymentStatus = "pending";
		} else {
			paymentStatus = "failed";
		}

		await db
			.update(payments)
			.set({
				status: paymentStatus,
				metadata: sql`jsonb_build_object('lencoPaymentId', ${lencoData?.id || null}::text)`,
			})
			.where(
				and(
					eq(payments.gatewayReference, reference),
					sql`${payments.status} IN ('initiated', 'pending')`,
				),
			);

		if (isSuccessful) {
			paymentStatusGateway.emit(reference, {
				event: "payment.completed",
				reference,
			});

			await sendInngestEvent("payment/process.fulfillment", {
				reference,
				gateway: "lenco",
				userId: localPayment.userId,
				courseId: localPayment.courseId,
			});
		}

		return json({
			success: isSuccessful,
			status: lencoData?.status || paymentStatus,
			amount: lencoData?.amount
				? parseFloat(lencoData.amount)
				: Number(localPayment.amount),
			currency: lencoData?.currency || localPayment.currency,
			paymentMethod: lencoData?.type || "unknown",
			transactionId: lencoData?.id || "",
			lencoReference: lencoData?.lencoReference || "",
			fee: lencoData?.fee ? parseFloat(lencoData.fee) : undefined,
			processedAt: lencoData?.completedAt || undefined,
			enrolled: isSuccessful,
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Verification failed";
		throw error(502, message);
	}
};
