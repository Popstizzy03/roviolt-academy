import { redirect } from "@sveltejs/kit";

const DEFAULTS = {
	signin: "/signin",
	signup: "/signup",
	onboarding: "/onboarding",
	dashboard: "/dashboard",
} as const;

export function getRedirectTo(url: URL): string | null {
	return url.searchParams.get("redirectTo");
}

export function withRedirectTo(
	path: string,
	redirectTo: string | null,
): string {
	if (!redirectTo) return path;
	const separator = path.includes("?") ? "&" : "?";
	return `${path}${separator}redirectTo=${encodeURIComponent(redirectTo)}`;
}

export function postAuthRedirect(
	user: { onboardingCompleted?: boolean | null },
	redirectTo: string | null,
	fallback = DEFAULTS.dashboard,
): never {
	if (!user.onboardingCompleted) {
		throw redirect(
			303,
			withRedirectTo(DEFAULTS.onboarding, redirectTo || fallback),
		);
	}
	throw redirect(303, redirectTo || fallback);
}
