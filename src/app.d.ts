import type { Session } from "better-auth/minimal";

interface AuthUser {
	id: string;
	name: string | null;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	createdAt: Date;
	updatedAt: Date;
	role?: string | null | undefined;
	banned?: boolean | null | undefined;
	banReason?: string | null | undefined;
	banExpires?: Date | null | undefined;
	onboardingCompleted?: boolean | null | undefined;
	displayName?: string | null;
	bio?: string | null;
	interests?: string | null;
	specialty?: string | null;
	skillLevel?: string | null;
	acceptedTerms?: boolean | null | undefined;
	acceptedPrivacy?: boolean | null | undefined;
	marketingOptIn?: boolean | null | undefined;
	deletionStatus?: string | null | undefined;
	deletedAt?: Date | string | null | undefined;
}

declare global {
	namespace App {
		interface Locals {
			user?: AuthUser;
			session?: Session;
		}
	}
}
