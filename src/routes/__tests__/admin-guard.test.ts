import { describe, it, expect } from "vitest";
import { load } from "../(protected)/admin/+layout.server.js";

describe("(protected)/admin/+layout.server.ts", () => {
	it("allows admin role", async () => {
		const user = { id: "1", email: "admin@test.com", role: "admin" };
		const result = await load({ locals: { user } });
		expect(result).toEqual({});
	});

	it("blocks student role with 403", async () => {
		const user = { id: "2", email: "student@test.com", role: "student" };
		try {
			await load({ locals: { user } });
			expect.unreachable("Expected 403 error to be thrown");
		} catch (e) {
			expect(e.status).toBe(403);
		}
	});

	it("blocks instructor role with 403", async () => {
		const user = { id: "3", email: "instructor@test.com", role: "instructor" };
		try {
			await load({ locals: { user } });
			expect.unreachable("Expected 403 error to be thrown");
		} catch (e) {
			expect(e.status).toBe(403);
		}
	});

	it("blocks editor role with 403", async () => {
		const user = { id: "4", email: "editor@test.com", role: "editor" };
		try {
			await load({ locals: { user } });
			expect.unreachable("Expected 403 error to be thrown");
		} catch (e) {
			expect(e.status).toBe(403);
		}
	});

	it("blocks moderator role with 403", async () => {
		const user = { id: "5", email: "moderator@test.com", role: "moderator" };
		try {
			await load({ locals: { user } });
			expect.unreachable("Expected 403 error to be thrown");
		} catch (e) {
			expect(e.status).toBe(403);
		}
	});
});
