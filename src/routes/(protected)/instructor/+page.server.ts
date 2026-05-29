import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { courses } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) return { courses: [] };

	const userCourses = await db
		.select()
		.from(courses)
		.where(eq(courses.creatorId, userId))
		.orderBy(desc(courses.updatedAt));

	return { courses: userCourses };
};
