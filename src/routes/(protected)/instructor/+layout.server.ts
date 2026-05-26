import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const role = locals.user?.role;
	if (role !== "instructor" && role !== "admin" && role !== "editor") {
		throw error(403, "Insufficient permissions");
	}
	return {};
};
