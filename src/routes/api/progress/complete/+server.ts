import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { learningBlocks } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { completeBlock } from "$lib/server/gamification";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, "Authentication required");

	const { blockId, lessonId } = (await request.json()) as {
		blockId: string;
		lessonId: string;
	};

	const [block] = await db
		.select()
		.from(learningBlocks)
		.where(eq(learningBlocks.id, blockId))
		.limit(1);

	if (!block) throw error(404, "Block not found");

	const result = await completeBlock(
		locals.user.id,
		blockId,
		lessonId,
		block.points,
	);
	return json(result);
};
