import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { requireCan } from "$lib/server/authorize";
import type { Actions, PageServerLoad } from "./$types";

type Role = "student" | "admin" | "instructor" | "editor" | "moderator";

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) throw redirect(302, "/signin");
	requireCan(event.locals.user, "user", "set-role");

	const requests = await db
		.select({
			id: schema.roleRequest.id,
			userId: schema.roleRequest.userId,
			requestedRole: schema.roleRequest.requestedRole,
			status: schema.roleRequest.status,
			createdAt: schema.roleRequest.createdAt,
			userName: schema.user.name,
			userEmail: schema.user.email,
		})
		.from(schema.roleRequest)
		.leftJoin(schema.user, eq(schema.roleRequest.userId, schema.user.id))
		.orderBy(schema.roleRequest.createdAt);

	return { requests };
};

export const actions: Actions = {
	approve: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: "Unauthorized" });
		}

		const formData = await event.request.formData();
		const requestId = formData.get("requestId")?.toString();
		const userId = formData.get("userId")?.toString();
		const requestedRole = formData.get("requestedRole")?.toString();

		if (!requestId || !userId || !requestedRole) {
			return fail(400, { message: "Missing required fields" });
		}

		const [roleReq] = await db
			.select()
			.from(schema.roleRequest)
			.where(eq(schema.roleRequest.id, requestId))
			.limit(1);

		if (!roleReq || roleReq.userId !== userId) {
			return fail(404, { message: "Request not found" });
		}

		await auth.api.setRole({
			body: { userId, role: requestedRole as Role },
			headers: event.request.headers,
		});

		await db
			.update(schema.roleRequest)
			.set({ status: "approved", updatedAt: new Date() })
			.where(eq(schema.roleRequest.id, requestId));

		return { success: true, message: `${requestedRole} role approved` };
	},

	reject: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: "Unauthorized" });
		}

		const formData = await event.request.formData();
		const requestId = formData.get("requestId")?.toString();

		if (!requestId) {
			return fail(400, { message: "Missing request ID" });
		}

		await db
			.update(schema.roleRequest)
			.set({ status: "rejected", updatedAt: new Date() })
			.where(eq(schema.roleRequest.id, requestId));

		return { success: true, message: "Request rejected" };
	},
};
