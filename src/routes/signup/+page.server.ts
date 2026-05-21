import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { auth } from "$lib/server/auth";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, "/dashboard");
	}
	return {};
};

export const actions: Actions = {
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get("email")?.toString() ?? "";
		const password = formData.get("password")?.toString() ?? "";
		const name = formData.get("name")?.toString() ?? "";
		const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

		if (password !== confirmPassword) {
			return fail(400, { message: "Passwords do not match" });
		}

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

		return {
			success: true,
			message: "Account created! Check your email for the verification link.",
		};
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
