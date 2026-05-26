import { describe, it, expect } from "vitest";
import { load } from "../+layout.server.js";

const baseEvent = {
	url: new URL("http://test.com/"),
	request: { method: "GET" },
};

const baseUser = {
	id: "1",
	email: "test@test.com",
	name: "Test User",
	emailVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};
const mockSession = { id: "s1", userId: "1", expiresAt: new Date() };

describe("root +layout.server.ts", () => {
	it("returns session and user from locals", async () => {
		const result = await load({
			...baseEvent,
			locals: { user: baseUser, session: mockSession },
		} as never);
		expect(result).toEqual({ user: baseUser, session: mockSession });
	});

	it("returns undefined session and user when unauthenticated", async () => {
		const result = await load({ ...baseEvent, locals: {} } as never);
		expect(result).toEqual({ session: undefined, user: undefined });
	});
});
