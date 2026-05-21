import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { and, eq } from "drizzle-orm";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
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
		const email = formData.get("email")?.toString() ?? "";
		const password = formData.get("password")?.toString() ?? "";

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
						message:
							"This email is linked to a Google/GitHub account. Sign in with that provider, or use 'Forgot password' to set a password for email login.",
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

		return redirect(302, "/onboarding");
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get("email")?.toString() ?? "";
		const password = formData.get("password")?.toString() ?? "";
		const name = formData.get("name")?.toString() ?? "";

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: "/onboarding",
				},
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || "Registration failed" });
			}
			return fail(500, { message: "Unexpected error" });
		}

		return { success: true, message: "Check your email for verification link" };
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
