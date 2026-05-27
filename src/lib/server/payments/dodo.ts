import crypto from "node:crypto";

export function verifyDodoWebhook(
	rawBody: string,
	headers: {
		"webhook-id": string | null;
		"webhook-timestamp": string | null;
		"webhook-signature": string | null;
	},
	webhookSecret: string,
): boolean {
	const {
		"webhook-id": id,
		"webhook-timestamp": timestamp,
		"webhook-signature": signature,
	} = headers;

	if (!id || !timestamp || !signature) return false;

	const signedMessage = `${id}.${timestamp}.${rawBody}`;
	const computed = crypto
		.createHmac("sha256", webhookSecret)
		.update(signedMessage)
		.digest("hex");

	if (computed.length !== signature.length) return false;
	return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

export function parseDodoMetadata(
	data: Record<string, unknown>,
): { userId: string; courseId: string } | null {
	const metadata = data.metadata as Record<string, unknown> | undefined;
	if (metadata?.userId && metadata?.courseId) {
		return {
			userId: String(metadata.userId),
			courseId: String(metadata.courseId),
		};
	}
	return null;
}
