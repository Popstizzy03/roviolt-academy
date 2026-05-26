import { describe, it, expect } from "vitest";
import { load } from "../(protected)/admin/+layout.server.js";

function mkUser(role: string) {
	return {
		id: "1",
		email: `${role}@test.com`,
		name: `${role} User`,
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		role,
	};
}

describe("(protected)/admin/+layout.server.ts", () => {
	it("allows admin role", async () => {
		const result = await load({
			locals: { user: mkUser("admin") },
			url: new URL("http://test.com/admin"),
			request: { method: "GET" },
		} as never);
		expect(result).toEqual({});
	});

	function assert403(user: Record<string, unknown>) {
		return async () => {
			try {
				await load({
					locals: { user },
					url: new URL("http://test.com/admin"),
					request: { method: "GET" },
				} as never);
				expect.unreachable("Expected 403 error to be thrown");
			} catch (e) {
				expect((e as { status: number }).status).toBe(403);
			}
		};
	}

	it("blocks student role with 403", assert403(mkUser("student")));

	it("blocks instructor role with 403", assert403(mkUser("instructor")));

	it("blocks editor role with 403", assert403(mkUser("editor")));

	it("blocks moderator role with 403", assert403(mkUser("moderator")));
});
