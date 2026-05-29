import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { getInngest } from "$lib/inngest/client";
import crypto from "node:crypto";

/**
 * Validates the Webhook-Signature header sent by Cloudflare Stream
 */
function verifyCloudflareSignature(
	signatureHeader: string | null,
	body: string,
	secret: string,
): boolean {
	if (!signatureHeader) return false;

	// Cloudflare sends header as: time=12345,sig1=abcdef...
	const parsedHeader = signatureHeader.split(",").reduce(
		(acc, part) => {
			const [key, value] = part.split("=");
			acc[key] = value;
			return acc;
		},
		{} as Record<string, string>,
	);

	if (!parsedHeader.time || !parsedHeader.sig1) return false;

	// Prevent replay attacks (reject payloads older than 5 minutes)
	const timeInt = parseInt(parsedHeader.time, 10);
	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - timeInt) > 300) return false;

	// Construct the payload string exactly as Cloudflare expects
	const signaturePayload = `${parsedHeader.time}.${body}`;

	const expectedSignature = crypto
		.createHmac("sha256", secret)
		.update(signaturePayload)
		.digest("hex");

	return crypto.timingSafeEqual(
		Buffer.from(expectedSignature),
		Buffer.from(parsedHeader.sig1),
	);
}

export const POST: RequestHandler = async ({ request }) => {
	const rawBody = await request.text();
	const signature = request.headers.get("Webhook-Signature");

	if (
		!env.CLOUDFLARE_WEBHOOK_SECRET ||
		!verifyCloudflareSignature(
			signature,
			rawBody,
			env.CLOUDFLARE_WEBHOOK_SECRET,
		)
	) {
		throw error(401, "Invalid cryptographic webhook signature");
	}

	const payload = JSON.parse(rawBody);

	try {
		// Event type filtering: We only care when a video finishes encoding
		if (payload.type === "video.encoding.ready") {
			// Fast-handoff to Inngest Event Bus
			await getInngest().send({
				name: "media/video.ready",
				// Idempotency lock to prevent double-processing
				id: `cf-stream-ready-${payload.uid}`,
				data: {
					uid: payload.uid,
					status: payload.status,
					creatorId: payload.creator,
					duration: payload.meta?.duration,
				},
			});
		}

		// Acknowledge receipt within milliseconds
		return json({ received: true });
	} catch (err) {
		console.error("[Cloudflare Webhook Ingestion Error]", err);
		throw error(500, "Failed to ingest webhook payload");
	}
};
