import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(
			302,
			`/signin?redirectTo=${encodeURIComponent(url.pathname + url.search)}`,
		);
	}
	return { user: locals.user };
};
