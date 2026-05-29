import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { payments } from "$lib/server/db/schema";
import { encodeLencoReference } from "$lib/server/payments/lenco";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, "Authentication required");

	const { courseId, amount, currency } = await request.json();

	if (!courseId || !amount) {
		throw error(400, "Missing required fields: courseId, amount");
	}

	const reference = encodeLencoReference(locals.user.id, courseId);
	const paymentId = crypto.randomUUID();

	await db.insert(payments).values({
		id: paymentId,
		userId: locals.user.id,
		courseId,
		gateway: "lenco",
		gatewayReference: reference,
		amount: amount.toString(),
		currency: currency || "ZMW",
		status: "initiated",
	});

	return json({
		success: true,
		reference,
		amount,
		currency: currency || "ZMW",
	});
};
