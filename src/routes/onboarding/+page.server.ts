import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { sendWelcomeEmail } from "$lib/server/email";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, "/signin");
	}

	if (event.locals.user.onboardingCompleted) {
		return redirect(302, "/dashboard");
	}

	return {};
};

export const actions: Actions = {
	complete: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: "Unauthorized" });
		}

		const formData = await event.request.formData();
		const displayName = formData.get("displayName")?.toString() ?? "";
		const bio = formData.get("bio")?.toString() ?? "";
		const interests = formData.get("interests")?.toString() ?? "";
		const specialty = formData.get("specialty")?.toString() ?? "";
		const skillLevel = formData.get("skillLevel")?.toString() ?? "";
		const acceptedTerms = formData.get("acceptedTerms") === "true";
		const acceptedPrivacy = formData.get("acceptedPrivacy") === "true";
		const marketingOptIn = formData.get("marketingOptIn") === "true";

		if (!displayName) {
			return fail(400, { message: "Display name is required" });
		}

		if (!acceptedTerms || !acceptedPrivacy) {
			return fail(400, {
				message: "You must accept the Terms and Privacy Policy",
			});
		}

		await db
			.update(user)
			.set({
				displayName,
				bio,
				interests,
				specialty,
				skillLevel,
				acceptedTerms,
				acceptedPrivacy,
				marketingOptIn,
				onboardingCompleted: true,
			})
			.where(eq(user.id, event.locals.user.id));

		void sendWelcomeEmail({
			email: event.locals.user.email,
			name: event.locals.user.name ?? "",
		});

		return redirect(302, "/onboarding/complete");
	},
};
