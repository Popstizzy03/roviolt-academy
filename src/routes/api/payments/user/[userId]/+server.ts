import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { payments } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, "Authentication required");
	if (locals.user.id !== params.userId) throw error(403, "Forbidden");

	const result = await db
		.select()
		.from(payments)
		.where(eq(payments.userId, params.userId))
		.orderBy(desc(payments.createdAt))
		.limit(50);

	return json(result);
};
