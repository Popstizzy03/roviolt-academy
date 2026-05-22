import { hash, verify } from "@node-rs/argon2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { env } from "$env/dynamic/private";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import {
	sendResetPasswordEmail,
	sendVerificationEmail,
} from "$lib/server/email";

const adminByEmailPlugin = {
	id: "admin-by-email",
	init: () => ({
		options: {
			databaseHooks: {
				user: {
					create: {
						before: async (user: { email?: string }) => {
							if (user.email === "kabongorabboni03@gmail.com") {
								return { data: { ...user, role: "admin" } };
							}
							return { data: user };
						},
					},
				},
			},
		},
	}),
};

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["github", "google"],
		},
	},
	user: {
		additionalFields: {
			onboardingCompleted: {
				type: "boolean",
				required: false,
				defaultValue: false,
			},
			displayName: {
				type: "string",
				required: false,
			},
			bio: {
				type: "string",
				required: false,
			},
			interests: {
				type: "string",
				required: false,
			},
			specialty: {
				type: "string",
				required: false,
			},
			skillLevel: {
				type: "string",
				required: false,
			},
			acceptedTerms: {
				type: "boolean",
				required: true,
				defaultValue: false,
				input: true,
			},
			acceptedPrivacy: {
				type: "boolean",
				required: true,
				defaultValue: false,
				input: true,
			},
			marketingOptIn: {
				type: "boolean",
				required: false,
				defaultValue: false,
				input: true,
			},
			deletionStatus: {
				type: "string",
				required: false,
				defaultValue: "active",
				input: false,
			},
			deletedAt: {
				type: "date",
				required: false,
				input: false,
			},
		},
		deleteUser: {
			enabled: true,
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		password: {
			hash: async (password: string) => {
				return await hash(password, {
					memoryCost: 65536,
					timeCost: 3,
					parallelism: 4,
				});
			},
			verify: async ({ hash: hashedPassword, password }) => {
				return await verify(hashedPassword, password);
			},
		},
		sendResetPassword: async ({ user, url, token }) => {
			void sendResetPasswordEmail({ email: user.email, url, token, name: user.name ?? "" });
		},
	},
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }) => {
			void sendVerificationEmail({
				email: user.email,
				url,
				token,
				name: user.name ?? "",
			});
		},
		sendOnSignUp: true,
		sendOnSignIn: true,
		autoSignInAfterVerification: true,
	},
	plugins: [
		adminByEmailPlugin,
		admin({
			defaultRole: "student",
		}),
		sveltekitCookies(getRequestEvent),
	],
});
