import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// 1. The core user ledger with the system access roles integrated
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name"),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	// Integrated RBAC State System (comma-separated, e.g. "admin,instructor")
	role: text("role").default("student"),
	banned: boolean("banned").default(false),
	banReason: text("banReason"),
	banExpires: timestamp("banExpires"),
	// Onboarding
	onboardingCompleted: boolean("onboardingCompleted").default(false),
	displayName: text("displayName"),
	bio: text("bio"),
	interests: text("interests"),
	specialty: text("specialty"),
	skillLevel: text("skillLevel"),
	// Consents
	acceptedTerms: boolean("acceptedTerms").default(false).notNull(),
	acceptedPrivacy: boolean("acceptedPrivacy").default(false).notNull(),
	marketingOptIn: boolean("marketingOptIn").default(false).notNull(),
	// Grace-period deletion
	deletionStatus: text("deletionStatus").default("active").notNull(),
	deletedAt: timestamp("deletedAt"),
});

// 2. Token Ledger for State Sessions
export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	impersonatedBy: text("impersonatedBy"),
});

// 3. Provider Mapping for Credential Passwords and Future OAuth (Google, Apple) Links
export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

// 4. Cryptographic Nonce Store for Multi-Factor Verification Keys & Password Resets
export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt"),
});

// 5. Role Request Ledger — Tracks Student Applications for Instructor/Editor/Moderator Roles
export const roleRequest = pgTable("role_request", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	requestedRole: text("requestedRole").notNull(),
	status: text("status").notNull().default("pending"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});
