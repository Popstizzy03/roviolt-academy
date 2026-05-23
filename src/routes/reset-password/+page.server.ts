import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import { resetPasswordSchema, validateForm } from "$lib/validations";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = (event) => {
	const token = event.url.searchParams.get("token") ?? "";
	return { token };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const result = await validateForm(formData, resetPasswordSchema);

		if (!result.success) {
			return fail(400, { errors: result.errors });
		}

		const { token, newPassword } = result.data;

		try {
			await auth.api.resetPassword({
				body: {
					newPassword,
					token,
				},
			});
		} catch {
			return fail(400, {
				message: "Invalid or expired reset link. Please request a new one.",
			});
		}

		return redirect(302, "/signin");
	},
};
