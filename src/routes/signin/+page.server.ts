import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { and, eq } from "drizzle-orm";
import { sendInngestEvent } from "$lib/inngest/client";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { sendAccountRestored } from "$lib/server/email";
import { signinSchema, validateForm } from "$lib/validations";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, "/dashboard");
	}
	return {
		deleted: event.url.searchParams.get("deleted") === "true",
	};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const result = await validateForm(formData, signinSchema);

		if (!result.success) {
			return fail(400, { errors: result.errors });
		}

		const { email, password } = result.data;

		try {
			const [existingUser] = await db
				.select()
				.from(schema.user)
				.where(eq(schema.user.email, email))
				.limit(1);

			if (existingUser) {
				const [credentialAccount] = await db
					.select()
					.from(schema.account)
					.where(
						and(
							eq(schema.account.providerId, "credential"),
							eq(schema.account.userId, existingUser.id),
						),
					)
					.limit(1);

				if (!credentialAccount) {
					return fail(400, {
						errors: {
							email: [
								"This email is linked to a Google/GitHub account. Sign in with that provider, or use 'Forgot password' to set a password for email login.",
							],
						},
					});
				}
			}
		} catch {
			// DB unreachable — fall through to normal signInEmail
		}

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: "/onboarding",
				},
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || "Signin failed" });
			}
			return fail(500, { message: "Unexpected error" });
		}

		// Check if account was pending deletion and restore it
		try {
			const [pendingUser] = await db
				.select({
					id: schema.user.id,
					email: schema.user.email,
					name: schema.user.name,
					deletionStatus: schema.user.deletionStatus,
					deletedAt: schema.user.deletedAt,
				})
				.from(schema.user)
				.where(eq(schema.user.email, email))
				.limit(1);

			if (pendingUser?.deletionStatus === "pending_delete") {
				await db
					.update(schema.user)
					.set({ deletionStatus: "active", deletedAt: null })
					.where(eq(schema.user.id, pendingUser.id));

				await sendInngestEvent("user/deletion.cancelled", {
					userId: pendingUser.id,
				});

				void sendAccountRestored({
					email: pendingUser.email,
					name: pendingUser.name ?? "",
				});

				if (!pendingUser.deletedAt) {
					return fail(500, { message: "Invalid account state" });
				}
				const deletedAt = new Date(pendingUser.deletedAt);
				const deletionDate = new Date(
					deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
				);
				const daysLeft = Math.max(
					0,
					Math.ceil(
						(deletionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
					),
				);

				return {
					restored: true,
					daysLeft,
					deletionDate: deletionDate.toLocaleDateString(),
				};
			}
		} catch {
			// Restore failed silently — user is logged in regardless
		}

		return redirect(302, "/onboarding");
	},
	signInSocial: async (event) => {
		const formData = await event.request.formData();
		const provider = formData.get("provider")?.toString() ?? "github";
		const callbackURL =
			formData.get("callbackURL")?.toString() ?? "/onboarding";

		const result = await auth.api.signInSocial({
			body: {
				provider: provider as "github" | "google",
				callbackURL,
			},
		});

		if (result.url) {
			return redirect(302, result.url);
		}

		return fail(400, { message: "Social sign-in failed" });
	},
};
