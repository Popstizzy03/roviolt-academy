import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { auth } from "$lib/server/auth";
import { signupSchema, validateForm } from "$lib/validations";
import type { Actions, PageServerLoad } from "./$types";
import crypto from "node:crypto";

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, "/dashboard");
	}
	return {};
};

async function sha1(message: string): Promise<string> {
	return crypto.createHash("sha1").update(message).digest("hex");
}

async function isPasswordBreached(password: string): Promise<boolean> {
	try {
		const hash = await sha1(password);
		const prefix = hash.slice(0, 5);
		const suffix = hash.slice(5).toUpperCase();
		const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
		const text = await res.text();
		return text.split("\n").some((line) => line.startsWith(suffix));
	} catch {
		return false;
	}
}

export const actions: Actions = {
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const result = await validateForm(formData, signupSchema);

		if (!result.success) {
			return fail(400, { errors: result.errors });
		}

		const { email, password, name } = result.data;

		if (await isPasswordBreached(password)) {
			return fail(400, {
				errors: {
					password: [
						"This password has been exposed in a data breach. Please choose a different one.",
					],
				},
			});
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
