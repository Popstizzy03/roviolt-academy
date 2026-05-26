import { init } from "@sentry/sveltekit";
import { env } from "$env/dynamic/public";

init({
	dsn: env.PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0,
	environment: env.PUBLIC_SENTRY_ENVIRONMENT || "development",
});
