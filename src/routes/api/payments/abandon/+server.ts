import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { payments } from "$lib/server/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, "Authentication required");

	const { reference, reason } = await request.json();
	if (!reference) throw error(400, "Reference is required");

	try {
		await db
			.update(payments)
			.set({
				status: "cancelled",
				metadata: reason
					? sql`COALESCE(${payments.metadata}, '{}'::jsonb) || jsonb_build_object('cancelledReason', ${reason}::text)`
					: payments.metadata,
			})
			.where(
				and(
					eq(payments.gatewayReference, reference),
					eq(payments.userId, locals.user.id),
					sql`${payments.status} IN ('initiated', 'pending')`,
				),
			);
	} catch (e) {
		console.error(
			"Failed to abandon payment with metadata, retrying without:",
			e,
		);
		try {
			await db
				.update(payments)
				.set({ status: "cancelled" })
				.where(
					and(
						eq(payments.gatewayReference, reference),
						eq(payments.userId, locals.user.id),
						sql`${payments.status} IN ('initiated', 'pending')`,
					),
				);
		} catch (e2) {
			console.error("Failed to abandon payment even without metadata:", e2);
			throw error(500, "Failed to abandon payment");
		}
	}

	return json({ success: true });
};
