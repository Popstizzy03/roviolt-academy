import type { Handle, HandleServerError } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { sentryHandle, handleErrorWithSentry } from "@sentry/sveltekit";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { eq } from "drizzle-orm";
import { building } from "$app/environment";
import { sendInngestEvent } from "$lib/inngest/client";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		// Ensure the admin user always has the admin role (fixes stale sessions
		// created before the admin-by-email plugin was added).
		if (
			session.user.email === "kabongorabboni03@gmail.com" &&
			session.user.role !== "admin"
		) {
			session.user.role = "admin";
		}

		// Auto-restore accounts during the 30-day grace period.
		// Catches both email and OAuth users on any authenticated request.
		if (session.user.deletionStatus === "pending_delete") {
			await db
				.update(user)
				.set({ deletionStatus: "active", deletedAt: null })
				.where(eq(user.id, session.user.id));

			await sendInngestEvent("user/deletion.cancelled", {
				userId: session.user.id,
			});

			await sendInngestEvent("app/email.send", {
				type: "account-restored",
				data: {
					email: session.user.email,
					name: session.user.name ?? "",
				},
			});

			session.user.deletionStatus = "active";
		}

		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

const handleOnboardingGuard: Handle = async ({ event, resolve }) => {
	const user = event.locals.user;
	const path = event.url.pathname;

	if (
		user &&
		!user.onboardingCompleted &&
		!path.startsWith("/onboarding") &&
		!path.startsWith("/signin") &&
		!path.startsWith("/signup") &&
		!path.startsWith("/verify-email") &&
		!path.startsWith("/auth") &&
		!path.startsWith("/api") &&
		!path.startsWith("/terms") &&
		!path.startsWith("/privacy") &&
		!path.startsWith("/marketing")
	) {
		const url = event.url;
		const redirectTo =
			url.searchParams.get("redirectTo") || url.pathname + url.search;
		return Response.redirect(
			`${url.origin}/onboarding?redirectTo=${encodeURIComponent(redirectTo)}`,
			302,
		);
	}

	return resolve(event);
};

export const handle: Handle = sequence(
	sentryHandle(),
	handleBetterAuth,
	handleOnboardingGuard,
);

export const handleError = handleErrorWithSentry() satisfies HandleServerError;
