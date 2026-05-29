import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { courses } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ params }) => {
	const [course] = await db
		.select()
		.from(courses)
		.where(eq(courses.id, params.id))
		.limit(1);

	if (!course) throw error(404, "Course not found");
	return { course };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();
		const publishRaw = form.get("isPublished");

		const updates: Record<string, unknown> = {};

		const title = form.get("title") as string;
		if (title && title.length >= 3) updates.title = title;

		const description = form.get("description") as string;
		if (description) updates.description = description;

		const category = form.get("category") as string;
		if (category) updates.category = category;

		const priceRaw = form.get("price") as string;
		if (priceRaw) updates.price = parseInt(priceRaw, 10) || 0;

		const priceZmwRaw = form.get("priceZmw") as string;
		if (priceZmwRaw) updates.priceZmw = parseInt(priceZmwRaw, 10) || null;

		const thumbnail = form.get("thumbnail") as string;
		if (thumbnail) updates.thumbnail = thumbnail;

		const whatYoullLearnRaw = form.get("whatYoullLearn") as string;
		const prerequisitesRaw = form.get("prerequisites") as string;

		if (whatYoullLearnRaw || prerequisitesRaw) {
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
			updates.metadata = { whatYoullLearn, prerequisites };
		}

		if (publishRaw !== null) {
			updates.isPublished = publishRaw === "true";
		}

		updates.updatedAt = new Date();

		await db.update(courses).set(updates).where(eq(courses.id, params.id));

		throw redirect(303, "/admin/courses");
	},
};
