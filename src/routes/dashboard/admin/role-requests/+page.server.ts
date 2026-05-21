import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, "/login");
	}

	const currentRoles = event.locals.user.role ?? "";
	if (!currentRoles.split(",").includes("admin")) {
		return redirect(302, "/dashboard");
	}

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

		const [targetUser] = await db
			.select()
			.from(schema.user)
			.where(eq(schema.user.id, userId))
			.limit(1);

		if (!targetUser) {
			return fail(404, { message: "User not found" });
		}

		const currentRoles = targetUser.role
			? targetUser.role.split(",").filter(Boolean)
			: [];
		if (!currentRoles.includes(requestedRole)) {
			currentRoles.push(requestedRole);
		}

		await db
			.update(schema.user)
			.set({ role: currentRoles.join(",") })
			.where(eq(schema.user.id, userId));

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
