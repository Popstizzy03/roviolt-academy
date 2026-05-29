import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { courses, user } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const load: PageServerLoad = async () => {
	const allCourses = await db
		.select({
			id: courses.id,
			title: courses.title,
			description: courses.description,
			slug: courses.slug,
			thumbnail: courses.thumbnail,
			category: courses.category,
			instructorName: courses.instructorName,
			isPublished: courses.isPublished,
			price: courses.price,
			priceZmw: courses.priceZmw,
			createdAt: courses.createdAt,
			updatedAt: courses.updatedAt,
			creatorId: courses.creatorId,
			creatorEmail: user.email,
			creatorName: user.name,
		})
		.from(courses)
		.leftJoin(user, eq(courses.creatorId, user.id))
		.orderBy(desc(courses.updatedAt));

	return { courses: allCourses };
};
