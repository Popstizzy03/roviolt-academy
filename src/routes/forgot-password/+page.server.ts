import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, "/dashboard");
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get("email")?.toString() ?? "";

		if (!email) {
			return fail(400, { message: "Email is required" });
		}

		await auth.api.requestPasswordReset({
			body: {
				email,
				redirectTo: "/reset-password",
			},
		});

		return {
			success: true,
			message:
				"If an account with that email exists, we've sent a password reset link.",
		};
	},
};
