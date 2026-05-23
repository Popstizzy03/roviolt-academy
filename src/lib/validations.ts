import { z } from "zod";

/**
 * Validates a FormData object against a Zod schema.
 * Returns a structured object with data if valid, or a map of errors if invalid.
 */
export async function validateForm<T extends z.ZodRawShape>(
	formData: FormData,
	schema: z.ZodObject<T>,
) {
	const rawValues = Object.fromEntries(formData.entries());
	const result = await schema.safeParseAsync(rawValues);

	if (!result.success) {
		const errors = result.error.flatten().fieldErrors;
		return { success: false as const, errors };
	}

	return { success: true as const, data: result.data };
}

// --- Auth Schemas ---

export const signupSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signinSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, "Reset token is required"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

// --- Onboarding Schemas ---

export const onboardingSchema = z.object({
	displayName: z.string().min(2, "Display name must be at least 2 characters"),
	bio: z.string().max(500, "Bio must be under 500 characters").optional(),
	interests: z.string().optional(),
	specialty: z.string().optional(),
	skillLevel: z.enum(["beginner", "intermediate", "advanced", "expert"], {
		message: "Please select a valid skill level",
	}),
	acceptedTerms: z.literal("true", {
		message: "You must accept the Terms and Conditions",
	}),
	acceptedPrivacy: z.literal("true", {
		message: "You must accept the Privacy Policy",
	}),
	marketingOptIn: z.preprocess((val) => val === "true", z.boolean()).optional(),
});

// --- Settings & Admin Schemas ---

export const deleteAccountSchema = z.object({
	password: z.string().min(1, "Password is required to confirm deletion"),
	confirmDelete: z.literal("true", {
		message: "Please confirm account deletion",
	}),
});

export const roleRequestSchema = z.object({
	requestedRole: z.enum(["instructor", "editor", "moderator"], {
		message: "Please select a valid role",
	}),
});
