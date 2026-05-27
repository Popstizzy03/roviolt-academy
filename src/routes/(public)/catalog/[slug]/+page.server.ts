import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { courses, modules, lessons, enrollments } from "$lib/server/db/schema";
import { eq, asc, and, inArray } from "drizzle-orm";

export const load: PageServerLoad = async ({ params, locals }) => {
	const [course] = await db
		.select()
		.from(courses)
		.where(eq(courses.slug, params.slug))
		.limit(1);
	if (!course) throw error(404, "Course not found");

	const courseModules = await db
		.select()
		.from(modules)
		.where(eq(modules.courseId, course.id))
		.orderBy(asc(modules.order));

	const courseLessons =
		courseModules.length > 0
			? await db
					.select()
					.from(lessons)
					.where(
						inArray(
							lessons.moduleId,
							courseModules.map((m) => m.id),
						),
					)
					.orderBy(asc(lessons.order))
			: [];

	let enrollment = null;
	if (locals.user) {
		[enrollment] = await db
			.select()
			.from(enrollments)
			.where(
				and(
					eq(enrollments.userId, locals.user.id),
					eq(enrollments.courseId, course.id),
				),
			)
			.limit(1);
	}

	return { course, modules: courseModules, lessons: courseLessons, enrollment };
};

export const actions: Actions = {
	enroll: async ({ locals, params }) => {
		if (!locals.user) throw error(401, "Authentication required");

		const [course] = await db
			.select()
			.from(courses)
			.where(eq(courses.slug, params.slug))
			.limit(1);
		if (!course) throw error(404, "Course not found");

		const [existing] = await db
			.select()
			.from(enrollments)
			.where(
				and(
					eq(enrollments.userId, locals.user.id),
					eq(enrollments.courseId, course.id),
				),
			)
			.limit(1);

		if (!existing) {
			await db.insert(enrollments).values({
				id: crypto.randomUUID(),
				userId: locals.user.id,
				courseId: course.id,
				status: course.price === 0 ? "active" : "freemium",
			});
		}

		redirect(303, `/learn/${course.id}`);
	},
};
