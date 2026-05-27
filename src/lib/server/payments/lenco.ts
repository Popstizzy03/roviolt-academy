import crypto from "node:crypto";

export function verifyLencoWebhook(
	rawBody: string,
	signature: string | null,
	apiToken: string,
): boolean {
	if (!signature) return false;

	const webhookHashKey = crypto
		.createHash("sha256")
		.update(apiToken)
		.digest("hex");
	const computed = crypto
		.createHmac("sha512", webhookHashKey)
		.update(rawBody)
		.digest("hex");

	if (computed.length !== signature.length) return false;
	return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

const REFERENCE_PREFIX = "pay_";

export function encodeLencoReference(userId: string, courseId: string): string {
	const shortId = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
	return `${REFERENCE_PREFIX}${userId}_${courseId}_${shortId}`;
}

export function parseLencoReference(
	reference: string,
): { userId: string; courseId: string } | null {
	if (!reference.startsWith(REFERENCE_PREFIX)) return null;

	const parts = reference.split("_");
	if (parts.length < 3) return null;

	return {
		userId: parts[1],
		courseId: parts[2],
	};
}
