import { fail } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { roleRequestSchema, validateForm } from "$lib/validations";
import type { Actions } from "./$types";

const roleProgression: Record<string, string[]> = {
	student: ["instructor"],
	instructor: ["editor", "moderator"],
	editor: ["admin"],
	moderator: ["admin"],
};

export const actions: Actions = {
	request: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: "Unauthorized" });
		}

		const formData = await event.request.formData();
		const result = await validateForm(formData, roleRequestSchema);

		if (!result.success) {
			return fail(400, { errors: result.errors });
		}

		const { requestedRole } = result.data;
		const availableRoles =
			roleProgression[event.locals.user.role ?? "student"] ?? [];

		if (!availableRoles.includes(requestedRole)) {
			return fail(400, {
				errors: {
					requestedRole: ["Invalid role selected for your current level"],
				},
			});
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
				errors: {
					requestedRole: [
						`You already have a pending request for the ${requestedRole} role`,
					],
				},
			});
		}

		if (event.locals.user.role === requestedRole) {
			return fail(400, {
				errors: {
					requestedRole: [`You already have the ${requestedRole} role`],
				},
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
