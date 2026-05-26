import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import { getRedirectTo, withRedirectTo } from "$lib/redirect";
import { forgotPasswordSchema, validateForm } from "$lib/validations";
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
		const result = await validateForm(formData, forgotPasswordSchema);

		if (!result.success) {
			return fail(400, { errors: result.errors });
		}

		const { email } = result.data;
		const redirectTo = getRedirectTo(event.url);

		await auth.api.requestPasswordReset({
			body: {
				email,
				redirectTo: withRedirectTo("/reset-password", redirectTo),
			},
			headers: event.request.headers,
		});

		return {
			success: true,
			message:
				"If an account with that email exists, we've sent a password reset link.",
		};
	},
};
