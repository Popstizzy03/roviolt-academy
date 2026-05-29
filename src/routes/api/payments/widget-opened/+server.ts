import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { payments } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, "Authentication required");

	const { reference } = await request.json();
	if (!reference) throw error(400, "Reference is required");

	await db
		.update(payments)
		.set({ status: "pending" })
		.where(
			and(
				eq(payments.gatewayReference, reference),
				eq(payments.userId, locals.user.id),
				eq(payments.status, "initiated"),
			),
		);

	return json({ success: true });
};
