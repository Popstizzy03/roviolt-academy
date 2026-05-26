import { describe, it, expect } from "vitest";
import { load } from "../(protected)/instructor/+layout.server.js";

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

const baseEvent = {
	url: new URL("http://test.com/instructor"),
	request: { method: "GET" },
};

describe("(protected)/instructor/+layout.server.ts", () => {
	it("allows instructor role", async () => {
		const result = await load({
			...baseEvent,
			locals: { user: mkUser("instructor") },
		} as never);
		expect(result).toEqual({});
	});

	it("allows admin role", async () => {
		const result = await load({
			...baseEvent,
			locals: { user: mkUser("admin") },
		} as never);
		expect(result).toEqual({});
	});

	it("allows editor role", async () => {
		const result = await load({
			...baseEvent,
			locals: { user: mkUser("editor") },
		} as never);
		expect(result).toEqual({});
	});

	it("blocks student role with 403", async () => {
		try {
			await load({
				...baseEvent,
				locals: { user: mkUser("student") },
			} as never);
			expect.unreachable("Expected 403 error to be thrown");
		} catch (e) {
			expect((e as { status: number }).status).toBe(403);
		}
	});
});
