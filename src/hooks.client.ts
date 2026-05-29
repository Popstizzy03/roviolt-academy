import * as Sentry from "@sentry/sveltekit";
import { handleErrorWithSentry } from "@sentry/sveltekit";
import { env } from "$env/dynamic/public";

export const handleError = handleErrorWithSentry();

// Save SvelteKit's fetch wrapper before Sentry instruments it,
// so we can preserve the __sveltekit_fetch__ flag through Sentry's instrumentation.
// Sentry strips non-enumerable properties (like __sveltekit_fetch__) when wrapping fetch,
// causing false "using window.fetch" warnings from SvelteKit's dev mode.
const svelteKitFetch = window.fetch;

Sentry.init({
	dsn: env.PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0,
	environment: env.PUBLIC_SENTRY_ENVIRONMENT || "development",
	integrations: [
		Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
		Sentry.replayIntegration(),
		Sentry.browserTracingIntegration({
			instrumentPageLoad: true,
			instrumentNavigation: true,
		}),
		Sentry.browserProfilingIntegration(),
	],
	enableLogs: true,

	// Session Replay
	replaysSessionSampleRate: 1.0, // For testing, lowering in production recommended
	replaysOnErrorSampleRate: 1.0,

	// AI Agent monitoring
	streamGenAiSpans: true,
	sendDefaultPii: true,

	// Profiling
	profileSessionSampleRate: 1.0,
	tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
});

// Re-wrap fetch to ensure SvelteKit's __sveltekit_fetch__ flag is preserved
// through Sentry's fetch instrumentation (Sentry's wrapper strips non-enumerable properties)
const sentryFetch = window.fetch;
if (sentryFetch !== svelteKitFetch) {
	window.fetch = (input, init) => {
		if ((init as Record<string, unknown> | undefined)?.__sveltekit_fetch__) {
			return svelteKitFetch(input, init);
		}
		return sentryFetch(input, init);
	};
}

Sentry.setConversationId("my-conversation-123");
Sentry.logger.info("User triggered test log", { log_source: "sentry_test" });
Sentry.metrics.count("test_metric", 1);
