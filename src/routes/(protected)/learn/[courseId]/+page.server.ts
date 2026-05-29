import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { courses, modules, lessons } from "$lib/server/db/schema";
import { eq, asc, inArray } from "drizzle-orm";

export const load: PageServerLoad = async ({ params }) => {
	const courseId = params.courseId;

	const [course] = await db
		.select()
		.from(courses)
		.where(eq(courses.id, courseId))
		.limit(1);

	const courseModules = await db
		.select()
		.from(modules)
		.where(eq(modules.courseId, courseId))
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

	const firstLesson = courseLessons[0];
	if (firstLesson) {
		throw redirect(302, `/learn/${courseId}/${firstLesson.id}`);
	}

	return { course, modules: courseModules, lessons: courseLessons };
};
