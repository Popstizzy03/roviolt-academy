import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { courses, enrollments } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, `/signin?redirectTo=/courses/${params.slug}/checkout`);
	}

	const [course] = await db
		.select()
		.from(courses)
		.where(eq(courses.slug, params.slug))
		.limit(1);

	if (!course) throw error(404, "Course not found");
	if (course.price === 0) throw redirect(303, `/courses/${params.slug}`);

	const [enrollment] = await db
		.select({ id: enrollments.id })
		.from(enrollments)
		.where(
			and(
				eq(enrollments.userId, locals.user.id),
				eq(enrollments.courseId, course.id),
				eq(enrollments.status, "active"),
			),
		)
		.limit(1);

	return {
		course,
		isEnrolled: !!enrollment,
		userEmail: locals.user.email,
		userName: locals.user.name || locals.user.displayName || undefined,
	};
};
