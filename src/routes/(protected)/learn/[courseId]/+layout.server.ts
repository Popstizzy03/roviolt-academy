import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { checkCourseAccess } from "$lib/server/access";

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const courseId = params.courseId;
	if (!courseId) {
		throw error(400, "Missing course ID");
	}

	if (!locals.user) {
		throw error(401, "Authentication required");
	}

	const access = await checkCourseAccess(locals.user.id, courseId);

	if (!access.allowed) {
		if (access.reason === "freemium-limit") {
			throw error(403, {
				message: "Free preview limit reached. Purchase to continue.",
				freemiumLimit: access.freemiumLimit,
				freemiumLessonsViewed: access.freemiumLessonsViewed,
				code: "FREEMIUM_LIMIT",
			});
		}
		if (access.reason === "not-enrolled") {
			throw error(403, {
				message: "You are not enrolled in this course.",
				code: "NOT_ENROLLED",
			});
		}
		throw error(404, "Course not found");
	}

	return { access };
};
