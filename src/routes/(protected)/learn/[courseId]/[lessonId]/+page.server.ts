import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { courses, lessons, learningBlocks } from "$lib/server/db/schema";
import { eq, asc } from "drizzle-orm";
import { canAccessCourse } from "$lib/server/permissions";

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw error(401, "Unauthorized");

	const hasAccess = await canAccessCourse(
		locals.user.id,
		params.courseId,
		locals.user.role,
	);

	const [course] = await db
		.select({ slug: courses.slug })
		.from(courses)
		.where(eq(courses.id, params.courseId))
		.limit(1);

	// If not enrolled, return early
	if (!hasAccess) {
		return {
			isEnrolled: false,
			lesson: null,
			blocks: [],
			courseId: params.courseId,
			courseSlug: course?.slug,
		};
	}
	const [lesson] = await db
		.select()
		.from(lessons)
		.where(eq(lessons.id, params.lessonId))
		.limit(1);
	if (!lesson) throw error(404, "Lesson not found");

	const blocks = await db
		.select()
		.from(learningBlocks)
		.where(eq(learningBlocks.lessonId, lesson.id))
		.orderBy(asc(learningBlocks.order));

	return {
		isEnrolled: true,
		lesson,
		blocks,
		courseId: params.courseId,
		courseSlug: course?.slug,
	};
};
