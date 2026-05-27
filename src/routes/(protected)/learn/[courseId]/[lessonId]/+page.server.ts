import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { lessons, learningBlocks } from "$lib/server/db/schema";
import { eq, asc } from "drizzle-orm";

export const load: PageServerLoad = async ({ params }) => {
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

	return { lesson, blocks };
};
