import crypto from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import { courses, enrollments } from "$lib/server/db/schema";

export type CourseAccessResult =
	| { allowed: true; freemiumRemaining?: number }
	| {
			allowed: false;
			reason: "not-found" | "freemium-limit" | "not-enrolled";
			freemiumLimit?: number;
			freemiumLessonsViewed?: number;
	  };

export async function checkCourseAccess(
	userId: string,
	courseId: string,
): Promise<CourseAccessResult> {
	const [course, enrollment] = await Promise.all([
		db.select().from(courses).where(eq(courses.id, courseId)).limit(1),
		db
			.select()
			.from(enrollments)
			.where(
				and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
			)
			.limit(1),
	]);

	if (!course.length) {
		return { allowed: false, reason: "not-found" };
	}

	const courseData = course[0];
	const enrollmentData = enrollment[0];

	if (enrollmentData?.status === "active" || courseData.price === 0) {
		return { allowed: true };
	}

	if (
		courseData.freemiumLimit !== null &&
		!Number.isNaN(courseData.freemiumLimit)
	) {
		const viewed = enrollmentData?.freemiumLessonsViewed ?? 0;
		if (viewed >= courseData.freemiumLimit) {
			return {
				allowed: false,
				reason: "freemium-limit",
				freemiumLimit: courseData.freemiumLimit,
				freemiumLessonsViewed: viewed,
			};
		}
		return {
			allowed: true,
			freemiumRemaining: courseData.freemiumLimit - viewed,
		};
	}

	return { allowed: false, reason: "not-enrolled" };
}

export async function incrementFreemiumCounter(
	userId: string,
	courseId: string,
) {
	return await db
		.insert(enrollments)
		.values({
			id: `enr-${crypto.randomUUID()}`,
			userId,
			courseId,
			status: "freemium",
			freemiumLessonsViewed: 1,
		})
		.onConflictDoUpdate({
			target: [enrollments.userId, enrollments.courseId],
			set: {
				freemiumLessonsViewed: sql`${enrollments.freemiumLessonsViewed} + 1`,
			},
		});
}
