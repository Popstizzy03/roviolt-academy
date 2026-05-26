import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals }) => {
	if (locals.user?.role !== "admin") {
		throw error(403, "Insufficient permissions");
	}
	return {};
};
