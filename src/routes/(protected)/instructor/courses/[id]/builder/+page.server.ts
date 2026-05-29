import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import {
	courses,
	modules,
	lessons,
	learningBlocks,
} from "$lib/server/db/schema";
import { eq, asc, inArray } from "drizzle-orm";

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) throw error(401, "Unauthorized");

	const [course] = await db
		.select()
		.from(courses)
		.where(eq(courses.id, params.id))
		.limit(1);

	if (!course) throw error(404, "Course not found");
	if (course.creatorId !== user.id && user.role !== "admin") {
		throw error(403, "You can only edit your own courses");
	}

	const courseModules = await db
		.select()
		.from(modules)
		.where(eq(modules.courseId, params.id))
		.orderBy(asc(modules.order));

	const moduleIds = courseModules.map((m) => m.id);
	const courseLessons =
		moduleIds.length > 0
			? await db
					.select()
					.from(lessons)
					.where(inArray(lessons.moduleId, moduleIds))
					.orderBy(asc(lessons.order))
			: [];

	const lessonIds = courseLessons.map((l) => l.id);
	const courseBlocks =
		lessonIds.length > 0
			? await db
					.select()
					.from(learningBlocks)
					.where(inArray(learningBlocks.lessonId, lessonIds))
					.orderBy(asc(learningBlocks.order))
			: [];

	return {
		course,
		modules: courseModules,
		lessons: courseLessons,
		blocks: courseBlocks,
	};
};

export const actions: Actions = {
	addModule: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401, { message: "Unauthorized" });
		const form = await request.formData();
		const title = form.get("title") as string;
		const description = form.get("description") as string;

		if (!title || title.length < 2) {
			return fail(400, {
				message: "Module title must be at least 2 characters",
			});
		}

		const existingModules = await db
			.select()
			.from(modules)
			.where(eq(modules.courseId, params.id))
			.orderBy(asc(modules.order));

		const nextOrder =
			existingModules.length > 0
				? existingModules[existingModules.length - 1].order + 1
				: 1;

		await db.insert(modules).values({
			id: crypto.randomUUID(),
			courseId: params.id,
			title,
			description: description || null,
			order: nextOrder,
		});

		return { success: true };
	},

	updateModule: async ({ request }) => {
		const form = await request.formData();
		const moduleId = form.get("moduleId") as string;
		const title = form.get("title") as string;

		if (!moduleId || !title)
			return fail(400, { message: "Missing required fields" });

		await db
			.update(modules)
			.set({ title, description: (form.get("description") as string) || null })
			.where(eq(modules.id, moduleId));

		return { success: true };
	},

	deleteModule: async ({ request }) => {
		const form = await request.formData();
		const moduleId = form.get("moduleId") as string;
		if (!moduleId) return fail(400, { message: "Missing module ID" });

		await db.delete(modules).where(eq(modules.id, moduleId));
		return { success: true };
	},

	reorderModules: async ({ request }) => {
		const form = await request.formData();
		const orderData = form.get("order") as string; // JSON array of { id, order }

		if (!orderData) return fail(400, { message: "Missing order data" });

		const orderItems = JSON.parse(orderData) as Array<{
			id: string;
			order: number;
		}>;
		for (const item of orderItems) {
			await db
				.update(modules)
				.set({ order: item.order })
				.where(eq(modules.id, item.id));
		}

		return { success: true };
	},

	addLesson: async ({ request }) => {
		const form = await request.formData();
		const moduleId = form.get("moduleId") as string;
		const title = form.get("title") as string;

		if (!moduleId || !title)
			return fail(400, { message: "Missing required fields" });

		const existingLessons = await db
			.select()
			.from(lessons)
			.where(eq(lessons.moduleId, moduleId))
			.orderBy(asc(lessons.order));

		const nextOrder =
			existingLessons.length > 0
				? existingLessons[existingLessons.length - 1].order + 1
				: 1;

		await db.insert(lessons).values({
			id: crypto.randomUUID(),
			moduleId,
			title,
			description: (form.get("description") as string) || null,
			order: nextOrder,
		});

		return { success: true };
	},

	updateLesson: async ({ request }) => {
		const form = await request.formData();
		const lessonId = form.get("lessonId") as string;
		const title = form.get("title") as string;

		if (!lessonId || !title)
			return fail(400, { message: "Missing required fields" });

		await db
			.update(lessons)
			.set({ title, description: (form.get("description") as string) || null })
			.where(eq(lessons.id, lessonId));

		return { success: true };
	},

	deleteLesson: async ({ request }) => {
		const form = await request.formData();
		const lessonId = form.get("lessonId") as string;
		if (!lessonId) return fail(400, { message: "Missing lesson ID" });

		await db.delete(lessons).where(eq(lessons.id, lessonId));
		return { success: true };
	},

	reorderLessons: async ({ request }) => {
		const form = await request.formData();
		const orderData = form.get("order") as string;
		if (!orderData) return fail(400, { message: "Missing order data" });

		const orderItems = JSON.parse(orderData) as Array<{
			id: string;
			order: number;
		}>;
		for (const item of orderItems) {
			await db
				.update(lessons)
				.set({ order: item.order })
				.where(eq(lessons.id, item.id));
		}

		return { success: true };
	},

	addBlock: async ({ request }) => {
		const form = await request.formData();
		const lessonId = form.get("lessonId") as string;
		const type = form.get("type") as string;
		const configRaw = form.get("config") as string;

		if (!lessonId || !type)
			return fail(400, { message: "Missing required fields" });

		const existingBlocks = await db
			.select()
			.from(learningBlocks)
			.where(eq(learningBlocks.lessonId, lessonId))
			.orderBy(asc(learningBlocks.order));

		const nextOrder =
			existingBlocks.length > 0
				? existingBlocks[existingBlocks.length - 1].order + 1
				: 1;

		let config: Record<string, unknown> = {};
		if (configRaw) {
			try {
				config = JSON.parse(configRaw);
			} catch {
				config = {};
			}
		}

		await db.insert(learningBlocks).values({
			id: crypto.randomUUID(),
			lessonId,
			type,
			config,
			order: nextOrder,
			points: 100,
		});

		return { success: true };
	},

	updateBlock: async ({ request }) => {
		const form = await request.formData();
		const blockId = form.get("blockId") as string;
		const type = form.get("type") as string;
		const configRaw = form.get("config") as string;
		const pointsRaw = form.get("points") as string;

		if (!blockId) return fail(400, { message: "Missing block ID" });

		const updates: Record<string, unknown> = {};
		if (type) updates.type = type;
		if (configRaw) {
			try {
				updates.config = JSON.parse(configRaw);
			} catch {
				/* keep existing */
			}
		}
		if (pointsRaw) updates.points = parseInt(pointsRaw, 10) || 100;

		await db
			.update(learningBlocks)
			.set(updates)
			.where(eq(learningBlocks.id, blockId));
		return { success: true };
	},

	deleteBlock: async ({ request }) => {
		const form = await request.formData();
		const blockId = form.get("blockId") as string;
		if (!blockId) return fail(400, { message: "Missing block ID" });

		await db.delete(learningBlocks).where(eq(learningBlocks.id, blockId));
		return { success: true };
	},

	togglePublish: async ({ params }) => {
		const [course] = await db
			.select()
			.from(courses)
			.where(eq(courses.id, params.id))
			.limit(1);

		if (!course) return fail(404, { message: "Course not found" });

		await db
			.update(courses)
			.set({ isPublished: !course.isPublished, updatedAt: new Date() })
			.where(eq(courses.id, params.id));

		return { success: true, nowPublished: !course.isPublished };
	},
};
