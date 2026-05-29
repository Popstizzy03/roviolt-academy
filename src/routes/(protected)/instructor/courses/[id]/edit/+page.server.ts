import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { courses } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.user?.id;
	if (!userId) throw error(401, "Unauthorized");

	const [course] = await db
		.select()
		.from(courses)
		.where(eq(courses.id, params.id))
		.limit(1);

	if (!course) throw error(404, "Course not found");
	if (course.creatorId !== userId && locals.user?.role !== "admin") {
		throw error(403, "You can only edit your own courses");
	}

	return { course };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { message: "Unauthorized" });

		const [existing] = await db
			.select()
			.from(courses)
			.where(eq(courses.id, params.id))
			.limit(1);

		if (!existing) return fail(404, { message: "Course not found" });
		if (existing.creatorId !== user.id && user.role !== "admin") {
			return fail(403, { message: "Unauthorized" });
		}

		const form = await request.formData();
		const title = form.get("title") as string;
		const description = form.get("description") as string;
		const category = form.get("category") as string;
		const priceRaw = form.get("price") as string;
		const priceZmwRaw = form.get("priceZmw") as string;
		const thumbnail = form.get("thumbnail") as string;
		const whatYoullLearnRaw = form.get("whatYoullLearn") as string;
		const prerequisitesRaw = form.get("prerequisites") as string;

		if (!title || title.length < 3) {
			return fail(400, { message: "Title must be at least 3 characters" });
		}

		const price = parseInt(priceRaw, 10) || 0;
		const priceZmw = parseInt(priceZmwRaw, 10) || null;

		const whatYoullLearn = whatYoullLearnRaw
			? whatYoullLearnRaw
					.split("\n")
					.map((s) => s.trim())
					.filter(Boolean)
			: [];

		const prerequisites = prerequisitesRaw
			? prerequisitesRaw
					.split("\n")
					.map((s) => s.trim())
					.filter(Boolean)
			: [];

		await db
			.update(courses)
			.set({
				title,
				description: description || null,
				category: category || null,
				thumbnail: thumbnail || null,
				price,
				priceZmw,
				metadata: { whatYoullLearn, prerequisites },
				updatedAt: new Date(),
			})
			.where(eq(courses.id, params.id));

		throw redirect(303, `/instructor/courses/${params.id}/builder`);
	},
};
