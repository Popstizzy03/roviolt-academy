import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { sendInngestEvent } from "$lib/inngest/client";
import { getRedirectTo } from "$lib/redirect";
import { onboardingSchema, validateForm } from "$lib/validations";
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
		const result = await validateForm(formData, onboardingSchema);

		if (!result.success) {
			return fail(400, { errors: result.errors });
		}

		const {
			displayName,
			bio,
			interests,
			specialty,
			skillLevel,
			acceptedTerms,
			acceptedPrivacy,
			marketingOptIn,
		} = result.data;

		await db
			.update(user)
			.set({
				displayName,
				bio,
				interests,
				specialty,
				skillLevel,
				acceptedTerms: acceptedTerms === "true",
				acceptedPrivacy: acceptedPrivacy === "true",
				marketingOptIn,
				onboardingCompleted: true,
			})
			.where(eq(user.id, event.locals.user.id));

		await sendInngestEvent("app/email.send", {
			type: "welcome",
			data: {
				email: event.locals.user.email,
				name: event.locals.user.name ?? "",
			},
		});

		const redirectTo = getRedirectTo(event.url);

		throw redirect(302, redirectTo || "/onboarding/complete");
	},
};
