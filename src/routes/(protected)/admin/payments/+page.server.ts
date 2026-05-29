import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { payments, user, courses } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { fulfillEnrollment } from "$lib/server/payments/orchestrator";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
	const allPayments = await db
		.select({
			id: payments.id,
			gateway: payments.gateway,
			gatewayReference: payments.gatewayReference,
			amount: payments.amount,
			currency: payments.currency,
			status: payments.status,
			createdAt: payments.createdAt,
			userEmail: user.email,
			userName: user.name,
			courseTitle: courses.title,
			courseSlug: courses.slug,
		})
		.from(payments)
		.leftJoin(user, eq(payments.userId, user.id))
		.leftJoin(courses, eq(payments.courseId, courses.id))
		.orderBy(desc(payments.createdAt));

	return { payments: allPayments };
};

export const actions: Actions = {
	approve: async ({ request }) => {
		const form = await request.formData();
		const paymentId = form.get("paymentId") as string;

		if (!paymentId) {
			return fail(400, { message: "Payment ID is required" });
		}

		const payment = await db.query.payments.findFirst({
			where: eq(payments.id, paymentId),
		});

		if (!payment) {
			return fail(404, { message: "Payment not found" });
		}

		if (payment.status !== "pending") {
			return fail(400, { message: "Payment is not pending" });
		}

		try {
			await fulfillEnrollment(payment.gatewayReference);
			return { success: true };
		} catch (err) {
			console.error("[admin/payments] Approve error:", err);
			return fail(500, { message: "Failed to approve payment" });
		}
	},
};
