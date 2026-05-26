import { setContext, getContext } from "svelte";
import type { Session } from "better-auth";

type User = App.Locals["user"];

const CONTEXT_KEY = Symbol("USER_SESSION");

class UserSessionState {
	#user = $state<User>(undefined);
	#session = $state<Session | undefined>(undefined);

	constructor(user: User, session: Session | undefined) {
		this.#user = user;
		this.#session = session;
	}

	get current() {
		return this.#user;
	}

	get session() {
		return this.#session;
	}

	get isAuthenticated() {
		return this.#user !== null && this.#user !== undefined;
	}

	get isAdmin() {
		return this.#user?.role === "admin";
	}

	get isInstructor() {
		return this.#user?.role === "instructor";
	}

	get isStudent() {
		return this.#user?.role === "student";
	}

	get isEditor() {
		return this.#user?.role === "editor";
	}

	get isModerator() {
		return this.#user?.role === "moderator";
	}

	get displayName() {
		return this.#user?.displayName || this.#user?.name || "User";
	}

	get role() {
		return this.#user?.role || "unknown";
	}

	update(user: User, session: Session | undefined) {
		this.#user = user;
		this.#session = session;
	}
}

export function initUserSession(
	user: User,
	session: Session | undefined,
): UserSessionState {
	const state = new UserSessionState(user, session);
	setContext(CONTEXT_KEY, state);
	return state;
}

export function useUser(): UserSessionState {
	const ctx = getContext(CONTEXT_KEY) as UserSessionState | undefined;
	if (!ctx) {
		throw new Error(
			"useUser() must be called within a component that has a parent with initUserSession()",
		);
	}
	return ctx;
}
