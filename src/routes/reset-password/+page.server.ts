import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = (event) => {
	const token = event.url.searchParams.get("token") ?? "";
	return { token };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const token = formData.get("token")?.toString() ?? "";
		const newPassword = formData.get("newPassword")?.toString() ?? "";
		const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

		if (!token || !newPassword) {
			return fail(400, { message: "Missing required fields" });
		}

		if (newPassword.length < 8) {
			return fail(400, { message: "Password must be at least 8 characters" });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { message: "Passwords do not match" });
		}

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
