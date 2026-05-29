import { db } from "$lib/server/db";
import { enrollments, payments } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Handles the post-payment success workflow.
 * Called by the webhooks after verifying the cryptographic signature
 */
export async function fulfillEnrollment(gatewayRef: string): Promise<boolean> {
	// 1. Find the pending payment
	const payment = await db.query.payments.findFirst({
		where: eq(payments.gatewayReference, gatewayRef),
	});

	if (!payment || payment.status !== "pending") return false;

	// 2. Update payment status
	await db
		.update(payments)
		.set({ status: "succeeded" })
		.where(eq(payments.id, payment.id));

	// 3. Create enrollment (onConflictDoNothing prevents duplicates)
	await db
		.insert(enrollments)
		.values({
			id: crypto.randomUUID(),
			userId: payment.userId,
			courseId: payment.courseId,
			status: "active",
		})
		.onConflictDoNothing();

	return true;
}
