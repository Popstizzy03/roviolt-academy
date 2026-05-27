import crypto from "node:crypto";
import { describe, it, expect } from "vitest";
import {
	verifyLencoWebhook,
	encodeLencoReference,
	parseLencoReference,
} from "./lenco";

describe("verifyLencoWebhook", () => {
	const apiToken = "test-api-token-12345";

	it("returns true for valid signature", () => {
		const body = JSON.stringify({
			event: "collection.successful",
			data: { reference: "pay_user123_course456_abc123", amount: "10.00" },
		});
		const hashKey = crypto.createHash("sha256").update(apiToken).digest("hex");
		const signature = crypto
			.createHmac("sha512", hashKey)
			.update(body)
			.digest("hex");

		expect(verifyLencoWebhook(body, signature, apiToken)).toBe(true);
	});

	it("returns false for mismatched signature", () => {
		const body = '{"test":"data"}';
		expect(verifyLencoWebhook(body, "bad-signature", apiToken)).toBe(false);
	});

	it("returns false when signature header is missing", () => {
		expect(verifyLencoWebhook('{"test":"data"}', null, apiToken)).toBe(false);
	});

	it("returns false for empty signature", () => {
		expect(verifyLencoWebhook('{"test":"data"}', "", apiToken)).toBe(false);
	});
});

describe("encodeLencoReference", () => {
	it("returns a string starting with pay_", () => {
		const ref = encodeLencoReference("user1", "course1");
		expect(ref).toMatch(/^pay_user1_course1_/);
	});

	it("contains only allowed characters", () => {
		const ref = encodeLencoReference("user1", "course1");
		expect(ref).toMatch(/^[a-zA-Z0-9_.-]+$/);
	});

	it("produces unique references for same input", () => {
		const ref1 = encodeLencoReference("user1", "course1");
		const ref2 = encodeLencoReference("user1", "course1");
		expect(ref1).not.toBe(ref2);
	});
});

describe("parseLencoReference", () => {
	it("extracts userId and courseId from valid reference", () => {
		const result = parseLencoReference("pay_user123_course456_a1b2c3d4");
		expect(result).toEqual({ userId: "user123", courseId: "course456" });
	});

	it("returns null for reference without prefix", () => {
		expect(parseLencoReference("user123_course456")).toBeNull();
	});

	it("returns null for reference with too few parts", () => {
		expect(parseLencoReference("pay_user123")).toBeNull();
	});

	it("handles references with underscores in IDs", () => {
		const result = parseLencoReference("pay_user_123_course_456_uuid");
		expect(result).toEqual({ userId: "user", courseId: "123" });
	});

	it("roundtrips correctly", () => {
		const encoded = encodeLencoReference("test-user", "test-course");
		const parsed = parseLencoReference(encoded);
		expect(parsed).toEqual({ userId: "test-user", courseId: "test-course" });
	});
});
