import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { payments } from "$lib/server/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, "Authentication required");

	const { reference } = params;

	const result = await db
		.update(payments)
		.set({ status: "cancelled" })
		.where(
			and(
				eq(payments.gatewayReference, reference),
				eq(payments.userId, locals.user.id),
				sql`${payments.status} IN ('initiated', 'pending')`,
			),
		)
		.returning({ id: payments.id });

	if (result.length === 0) {
		throw error(404, "Payment not found or cannot be cancelled");
	}

	return json({ success: true });
};
