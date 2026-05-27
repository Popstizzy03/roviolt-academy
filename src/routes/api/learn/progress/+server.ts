import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
	incrementFreemiumCounter,
	checkCourseAccess,
} from "$lib/server/access";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, "Authentication required");

	const { courseId } = (await request.json()) as { courseId: string };
	if (!courseId) throw error(400, "Missing courseId");

	const access = await checkCourseAccess(locals.user.id, courseId);

	if (!access.allowed) {
		throw error(403, "Access denied");
	}

	if ("freemiumRemaining" in access && access.freemiumRemaining !== undefined) {
		await incrementFreemiumCounter(locals.user.id, courseId);
	}

	return json({ ok: true });
};
