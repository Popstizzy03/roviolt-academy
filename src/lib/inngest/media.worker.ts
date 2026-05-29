import { getInngest, sendInngestEvent } from "./client";
import { db } from "$lib/server/db";
import {
	courses,
	learningBlocks,
	lessons,
	modules,
	user,
} from "$lib/server/db/schema";
import { eq, sql } from "drizzle-orm";

const inngest = getInngest();

export const processReadyVideo = inngest.createFunction(
	{
		id: "process-cloudflare-video",
		retries: 3,
		triggers: { event: "media/video.ready" } as const,
	},
	async ({
		event,
		step,
	}: {
		event: { data: { uid: string; creatorId: string } };
		step: { run: (id: string, fn: () => Promise<unknown>) => Promise<unknown> };
	}) => {
		const { uid } = event.data;

		await step.run("update-learning-block", async () => {
			return await db
				.update(learningBlocks)
				.set({
					config: sql`jsonb_set(${learningBlocks.config}, '{status}', '"ready"')`,
				})
				.where(sql`${learningBlocks.config}->>'uid' = ${uid}`);
		});

		await step.run("notify-creator", async () => {
			const [result] = await db
				.select({
					courseTitle: courses.title,
					creatorEmail: user.email,
					creatorName: user.name,
				})
				.from(learningBlocks)
				.innerJoin(lessons, eq(learningBlocks.lessonId, lessons.id))
				.innerJoin(modules, eq(lessons.moduleId, modules.id))
				.innerJoin(courses, eq(modules.courseId, courses.id))
				.innerJoin(user, eq(user.id, courses.creatorId))
				.where(sql`${learningBlocks.config}->>'uid' = ${uid}`)
				.limit(1);

			if (result?.creatorEmail) {
				await sendInngestEvent("app/email.send", {
					type: "video-ready",
					data: {
						email: result.creatorEmail,
						name: result.creatorName ?? "Instructor",
						courseTitle: result.courseTitle,
					},
				} as never);
			}
		});

		return { success: true, processedUid: uid };
	},
);
