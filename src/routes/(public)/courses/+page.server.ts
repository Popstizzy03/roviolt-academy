import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { courses } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async () => {
	const allCourses = await db
		.select()
		.from(courses)
		.where(eq(courses.isPublished, true));
	return { courses: allCourses };
};
