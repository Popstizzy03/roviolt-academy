import { boolean, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// 1. The core user ledger with the system access roles integrated
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name"),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	// Single-role RBAC (one of: student, instructor, editor, moderator, admin)
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

// ── Course Content ──────────────────────────────────────────────────────────

export const courses = pgTable("courses", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	slug: text("slug").notNull().unique(),
	thumbnail: text("thumbnail"),
	isPublished: boolean("is_published").default(false).notNull(),
	price: integer("price").notNull(),
	freemiumLimit: integer("freemium_limit"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const modules = pgTable("modules", {
	id: text("id").primaryKey(),
	courseId: text("course_id")
		.notNull()
		.references(() => courses.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	description: text("description"),
	order: integer("order").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
	id: text("id").primaryKey(),
	moduleId: text("module_id")
		.notNull()
		.references(() => modules.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	description: text("description"),
	order: integer("order").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningBlocks = pgTable("learning_blocks", {
	id: text("id").primaryKey(),
	lessonId: text("lesson_id")
		.notNull()
		.references(() => lessons.id, { onDelete: "cascade" }),
	type: text("type").notNull(),
	config: jsonb("config").notNull(),
	order: integer("order").notNull(),
	points: integer("points").default(100).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Enrollment & Payments ───────────────────────────────────────────────────

export const enrollments = pgTable(
	"enrollments",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		courseId: text("course_id")
			.notNull()
			.references(() => courses.id, { onDelete: "cascade" }),
		status: text("status").default("freemium").notNull(),
		freemiumLessonsViewed: integer("freemium_lessons_viewed").default(0).notNull(),
		enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		uniqueEnrollment: uniqueIndex("unique_enrollment").on(table.userId, table.courseId),
	}),
);

export const payments = pgTable("payments", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	courseId: text("course_id")
		.notNull()
		.references(() => courses.id),
	gateway: text("gateway").notNull(),
	gatewayReference: text("gateway_reference").notNull().unique(),
	amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
	currency: text("currency").notNull(),
	status: text("status").notNull().default("pending"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Gamification ────────────────────────────────────────────────────────────

export const userProgression = pgTable("user_progression", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	xp: integer("xp").default(0).notNull(),
	level: integer("level").default(1).notNull(),
	currentStreak: integer("current_streak").default(0).notNull(),
	longestStreak: integer("longest_streak").default(0).notNull(),
	lastActiveAt: timestamp("last_active_at"),
});

export const blockCompletions = pgTable(
	"block_completions",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		blockId: text("block_id")
			.notNull()
			.references(() => learningBlocks.id, { onDelete: "cascade" }),
		lessonId: text("lesson_id").notNull(),
		completedAt: timestamp("completed_at").defaultNow().notNull(),
	},
	(table) => ({
		uniqueBlockCompletion: uniqueIndex("unique_block_completion").on(table.userId, table.blockId),
	}),
);
