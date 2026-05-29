import { getTextDirection } from "$lib/paraglide/runtime";
import { paraglideMiddleware } from "$lib/paraglide/server";
import type { Handle, HandleServerError } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import {
	sentryHandle,
	handleErrorWithSentry,
	init as sentryInit,
} from "@sentry/sveltekit";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { env } from "$env/dynamic/private";

sentryInit({
	dsn: env.SENTRY_DSN,
	tracesSampleRate: 1.0,
	environment: env.PUBLIC_SENTRY_ENVIRONMENT || "development",
	streamGenAiSpans: true,
	sendDefaultPii: true,
	integrations: [nodeProfilingIntegration()],
	profileSessionSampleRate: 1.0,
	profileLifecycle: "trace",
});

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
				data: { email: session.user.email, name: session.user.name ?? "" },
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

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace("%paraglide.lang%", locale)
					.replace("%paraglide.dir%", getTextDirection(locale)),
		});
	});

const handleDocumentPolicy: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set("Document-Policy", "js-profiling");

	return response;
};

export const originalHandle: Handle = sequence(
	sentryHandle(),
	handleDocumentPolicy,
	handleBetterAuth,
	handleOnboardingGuard,
	handleParaglide,
);

export const handleError = handleErrorWithSentry() satisfies HandleServerError;

export const handle = sequence(originalHandle);
// Ensure the admin user always has the admin role (fixes stale sessions
// created before the admin-by-email plugin was added).
// Auto-restore accounts during the 30-day grace period.
// Catches both email and OAuth users on any authenticated request.
