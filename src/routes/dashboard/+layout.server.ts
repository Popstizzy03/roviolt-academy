import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = (event) => {
	const user = event.locals.user;
	if (!user) {
		const redirectTo = event.url.pathname + event.url.search;
		throw redirect(302, `/signin?redirectTo=${encodeURIComponent(redirectTo)}`);
	}
	return { user };
};
