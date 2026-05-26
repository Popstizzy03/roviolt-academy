import { describe, it, expect } from "vitest";
import { load } from "../(protected)/instructor/+layout.server.js";

describe("(protected)/instructor/+layout.server.ts", () => {
	it("allows instructor role", async () => {
		const user = { id: "1", email: "instructor@test.com", role: "instructor" };
		const result = await load({ locals: { user } });
		expect(result).toEqual({});
	});

	it("allows admin role", async () => {
		const user = { id: "2", email: "admin@test.com", role: "admin" };
		const result = await load({ locals: { user } });
		expect(result).toEqual({});
	});

	it("allows editor role", async () => {
		const user = { id: "3", email: "editor@test.com", role: "editor" };
		const result = await load({ locals: { user } });
		expect(result).toEqual({});
	});

	it("blocks student role with 403", async () => {
		const user = { id: "4", email: "student@test.com", role: "student" };
		try {
			await load({ locals: { user } });
			expect.unreachable("Expected 403 error to be thrown");
		} catch (e) {
			expect(e.status).toBe(403);
		}
	});
});
