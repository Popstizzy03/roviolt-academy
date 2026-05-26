import { describe, it, expect } from "vitest";
import { load } from "../(protected)/+layout.server.js";

const mockUser = {
	id: "1",
	email: "user@test.com",
	name: "Auth User",
	emailVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("(protected)/+layout.server.ts", () => {
	it("redirects to /signin when no user", async () => {
		const url = new URL("http://test.com/dashboard/settings");
		try {
			await load({
				locals: {},
				url,
				request: { method: "GET" },
			} as never);
			expect.unreachable("Expected redirect to be thrown");
		} catch (e) {
			expect((e as { status: number; location: string }).status).toBe(302);
			expect((e as { status: number; location: string }).location).toBe(
				"/signin?redirectTo=%2Fdashboard%2Fsettings",
			);
		}
	});

	it("returns user when authenticated", async () => {
		const url = new URL("http://test.com/dashboard");
		const result = await load({
			locals: { user: mockUser },
			url,
			request: { method: "GET" },
		} as never);
		expect(result).toEqual({ user: mockUser });
	});
});
