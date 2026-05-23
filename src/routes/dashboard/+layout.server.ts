import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = (event) => {
	const user = event.locals.user;
	if (!user) {
		return redirect(302, "/signin");
	}
	return { user };
};
