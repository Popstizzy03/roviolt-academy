import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { sendInngestEvent } from "$lib/inngest/client";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import {
	sendAccountDeletionConfirmation,
	sendAccountRestored,
} from "$lib/server/email";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = (event) => {
	if (!event.locals.user) {
		return redirect(302, "/signin");
	}
	return { user: event.locals.user };
};

export const actions: Actions = {
	deleteAccount: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: "Unauthorized" });
		}

		const formData = await event.request.formData();
		const password = formData.get("password")?.toString() ?? "";

		const userId = event.locals.user.id;

		try {
			await auth.api.verifyPassword({
				body: { password },
				headers: event.request.headers,
			});
		} catch {
			return fail(400, { message: "Incorrect password" });
		}

		await db
			.update(user)
			.set({
				deletionStatus: "pending_delete",
				deletedAt: new Date(),
			})
			.where(eq(user.id, userId));

		await sendInngestEvent("user/deletion.requested", { userId });

		void sendAccountDeletionConfirmation({
			email: event.locals.user.email,
		});

		await auth.api.signOut({
			headers: event.request.headers,
		});

		return redirect(302, "/signin?deleted=true");
	},

	restoreAccount: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: "Unauthorized" });
		}

		const userId = event.locals.user.id;

		await db
			.update(user)
			.set({
				deletionStatus: "active",
				deletedAt: null,
			})
			.where(eq(user.id, userId));

		await sendInngestEvent("user/deletion.cancelled", { userId });

		void sendAccountRestored({
			email: event.locals.user.email,
		});

		return { restored: true };
	},
};
