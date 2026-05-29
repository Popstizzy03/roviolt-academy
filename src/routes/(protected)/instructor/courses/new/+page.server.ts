import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { courses } from "$lib/server/db/schema";

function generateSlug(title: string): string {
	const base = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 80);
	return `${base}-${Date.now().toString(36)}`;
}

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { message: "Unauthorized" });

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

		const courseId = crypto.randomUUID();

		await db.insert(courses).values({
			id: courseId,
			title,
			description: description || null,
			slug: generateSlug(title),
			thumbnail: thumbnail || null,
			category: category || null,
			creatorId: user.id,
			instructorName: user.displayName || user.name || null,
			metadata: { whatYoullLearn, prerequisites },
			isPublished: false,
			price,
			priceZmw,
		});

		throw redirect(303, `/instructor/courses/${courseId}/builder`);
	},
};
