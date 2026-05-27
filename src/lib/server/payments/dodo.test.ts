import crypto from "node:crypto";
import { describe, it, expect } from "vitest";
import { verifyDodoWebhook, parseDodoMetadata } from "./dodo";

describe("verifyDodoWebhook", () => {
	const secret = "whsec_test-secret-key";

	it("returns true for valid signature", () => {
		const body = JSON.stringify({
			type: "payment.succeeded",
			data: { payment_id: "pay_123" },
		});
		const id = "msg_test123";
		const timestamp = "1700000000";
		const signedMessage = `${id}.${timestamp}.${body}`;
		const signature = crypto
			.createHmac("sha256", secret)
			.update(signedMessage)
			.digest("hex");

		const headers = {
			"webhook-id": id,
			"webhook-timestamp": timestamp,
			"webhook-signature": signature,
		};

		expect(verifyDodoWebhook(body, headers, secret)).toBe(true);
	});

	it("returns false for mismatched signature", () => {
		const headers = {
			"webhook-id": "id1",
			"webhook-timestamp": "1700000000",
			"webhook-signature": "bad-sig",
		};
		expect(verifyDodoWebhook('{"test":"data"}', headers, secret)).toBe(false);
	});

	it("returns false when required headers are missing", () => {
		expect(
			verifyDodoWebhook(
				'{"test":"data"}',
				{
					"webhook-id": null,
					"webhook-timestamp": null,
					"webhook-signature": null,
				},
				secret,
			),
		).toBe(false);
	});

	it("returns false for empty signature", () => {
		const headers = {
			"webhook-id": "id1",
			"webhook-timestamp": "1700000000",
			"webhook-signature": "",
		};
		expect(verifyDodoWebhook('{"test":"data"}', headers, secret)).toBe(false);
	});
});

describe("parseDodoMetadata", () => {
	it("extracts userId and courseId from metadata", () => {
		const data = {
			metadata: { userId: "user123", courseId: "course456" },
			payment_id: "pay_123",
		};
		expect(parseDodoMetadata(data)).toEqual({
			userId: "user123",
			courseId: "course456",
		});
	});

	it("returns null when metadata is missing", () => {
		expect(parseDodoMetadata({ payment_id: "pay_123" })).toBeNull();
	});

	it("returns null when metadata is empty object", () => {
		expect(parseDodoMetadata({ metadata: {} })).toBeNull();
	});

	it("returns null when metadata lacks userId", () => {
		expect(
			parseDodoMetadata({ metadata: { courseId: "course456" } }),
		).toBeNull();
	});

	it("returns null when metadata lacks courseId", () => {
		expect(
			parseDodoMetadata({ metadata: { userId: "user123" } }),
		).toBeNull();
	});

	it("coerces numeric values to strings", () => {
		const data = {
			metadata: { userId: 123, courseId: 456 },
		};
		const result = parseDodoMetadata(data as unknown as Record<string, unknown>);
		expect(result).toEqual({ userId: "123", courseId: "456" });
	});
});
