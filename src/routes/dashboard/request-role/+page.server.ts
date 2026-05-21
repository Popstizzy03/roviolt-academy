import { fail, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, "/login");
	}
	return {};
};

export const actions: Actions = {
	request: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: "Unauthorized" });
		}

		const formData = await event.request.formData();
		const requestedRole = formData.get("requestedRole")?.toString();

		if (!requestedRole) {
			return fail(400, { message: "Please select a role" });
		}

		const validRoles = ["instructor", "editor", "moderator"];
		if (!validRoles.includes(requestedRole)) {
			return fail(400, { message: "Invalid role selected" });
		}

		const existingRequest = await db
			.select()
			.from(schema.roleRequest)
			.where(
				and(
					eq(schema.roleRequest.userId, event.locals.user.id),
					eq(schema.roleRequest.requestedRole, requestedRole),
					eq(schema.roleRequest.status, "pending"),
				),
			)
			.limit(1);

		if (existingRequest.length > 0) {
			return fail(400, {
				message: `You already have a pending request for the ${requestedRole} role`,
			});
		}

		const currentRoles = event.locals.user.role
			? event.locals.user.role.split(",").filter(Boolean)
			: [];
		if (currentRoles.includes(requestedRole)) {
			return fail(400, {
				message: `You already have the ${requestedRole} role`,
			});
		}

		await db.insert(schema.roleRequest).values({
			id: crypto.randomUUID(),
			userId: event.locals.user.id,
			requestedRole,
			status: "pending",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return {
			success: true,
			message: `Request for ${requestedRole} role submitted`,
		};
	},
};
