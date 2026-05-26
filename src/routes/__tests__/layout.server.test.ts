import { describe, it, expect } from "vitest";
import { load } from "../+layout.server.js";

const mockUser = { id: "1", email: "test@test.com", name: "Test User" };
const mockSession = { id: "s1", userId: "1", expiresAt: new Date() };

describe("root +layout.server.ts", () => {
	it("returns session and user from locals", async () => {
		const result = await load({
			locals: { user: mockUser, session: mockSession },
		});
		expect(result).toEqual({ user: mockUser, session: mockSession });
	});

	it("returns undefined session and user when unauthenticated", async () => {
		const result = await load({ locals: {} });
		expect(result).toEqual({ session: undefined, user: undefined });
	});
});
