# NEXT_STEPS.md — Roviolt Academy Build Plan

## Execution Strategy

The plan is split into **3 Waves** (instead of 7 isolated phases) to minimize file conflicts and context-switching:

```
Wave 1: Architecture Foundation ────── sets up the routing tree exactly once
Wave 2: Infrastructure Layer   ────── parallel-safe, zero schema changes
Wave 3: Product Layer (MVP)    ────── single schema migration, unified access model
```

Each wave is self-contained and independently testable. After each wave I will ask if you want tests written before proceeding.

---

## Wave 1: Architecture Foundation

**Estimate:** 1-2 sessions  
**Concept:** Set up the reactive session context + restructure the entire routing tree in one pass.

### 1a — Root Layout Server + Client-Side Session Module

**Files to create/modify:**

| File | Action |
|------|--------|
| `src/routes/+layout.server.ts` | CREATE |
| `src/lib/client/state/user.svelte.ts` | CREATE |
| `src/routes/+layout.svelte` | MODIFY |

**Step-by-step:**

1. **Create `src/routes/+layout.server.ts`**
   ```ts
   import type { LayoutServerLoad } from "./$types";

   export const load: LayoutServerLoad = async ({ locals }) => {
   	return {
   		session: locals.session,
   		user: locals.user,
   	};
   };
   ```

2. **Create `src/lib/client/state/user.svelte.ts`**
   - Define a `UserSessionState` class with `$state` runes for `user` and `session`
   - Expose getters: `current`, `isAuthenticated`, `isAdmin`, `isInstructor`, `isStudent`
   - Expose `update(user, session)` method for reactive sync
   - Export `initUserSession(user, session)` using `setContext(Symbol)`
   - Export `useUser()` using `getContext(Symbol)` with guard

3. **Modify `src/routes/+layout.svelte`**
   - Import `initUserSession` from the new module
   - Extract `data` from `$props()` (SvelteKit automatically merges `+layout.server.ts` data)
   - Call `const sessionState = initUserSession(data.user, data.session)` at the top level
   - Add `$effect(() => { sessionState.update(data.user, data.session); })` to sync on navigation
   - Keep existing `ModeWatcher` + `<svelte:head>` + `{@render children()}`

4. **Append `Session` type import to `src/app.d.ts`**
   - Already has `import type { Session } from "better-auth/minimal";` — verify it's there

**Commit:**
```
feat: add root layout server and reactive session context module
```

**Verification:**
- Dev server starts without errors
- Any page can call `useUser()` and get the current session without passing `data` props

---

### 1b — Route Protection Restructure (RBAC Layout Guards)

**Files to create/modify:**

| File | Action |
|------|--------|
| `src/routes/(protected)/+layout.server.ts` | CREATE |
| `src/routes/(protected)/dashboard/` | MOVE from `src/routes/dashboard/` |
| `src/routes/(protected)/dashboard/+layout.server.ts` | MODIFY (simplify — inherits parent guard) |
| `src/routes/(protected)/admin/+layout.server.ts` | CREATE |
| `src/routes/(protected)/instructor/+layout.server.ts` | CREATE |
| `src/routes/(protection)/learn/+layout.server.ts` | CREATE (freemium guard — stub for Wave 3) |
| `src/routes/(public)/+layout.server.ts` | CREATE |
| `src/routes/(public)/signin/` | MOVE from `src/routes/signin/` |
| `src/routes/(public)/signup/` | MOVE from `src/routes/signup/` |
| `src/routes/(public)/forgot-password/` | MOVE |
| `src/routes/(public)/reset-password/` | MOVE |
| `src/routes/(public)/(markdown)/` | MOVE from `src/routes/(markdown)/` |
| `src/routes/+page.svelte` | MODIFY (root redirect or landing page) |

**Step-by-step:**

1. **Create `src/routes/(protected)/+layout.server.ts`**
   ```ts
   import { redirect } from "@sveltejs/kit";
   import type { LayoutServerLoad } from "./$types";

   export const load: LayoutServerLoad = async ({ locals, url }) => {
   	if (!locals.user) {
   		throw redirect(302, `/signin?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
   	}
   	return {};
   };
   ```
   This is the **primary auth boundary** — every route under `(protected)/` is blocked if unauthenticated.

2. **Create `src/routes/(public)/+layout.server.ts`**
   ```ts
   import type { LayoutServerLoad } from "./$types";

   export const load: LayoutServerLoad = async ({ locals }) => {
   	return {
   		session: locals.session,
   		user: locals.user,
   	};
   };
   ```
   Public routes still need session data (for conditional UI like "Sign In" vs "Dashboard" in nav).

3. **Move dashboard routes to `(protected)/dashboard/`**
   - `mv src/routes/dashboard src/routes/(protected)/dashboard`
   - Simplify `(protected)/dashboard/+layout.server.ts` — the parent `(protected)/+layout.server.ts` already handles auth, so the dashboard layout only needs to return `{ user }`.

4. **Create `src/routes/(protected)/admin/+layout.server.ts`**
   ```ts
   import { error } from "@sveltejs/kit";
   import type { LayoutServerLoad } from "./$types";

   export const load: LayoutServerLoad = async ({ parent }) => {
   	const { user } = await parent();
   	if (user?.role !== "admin") {
   		throw error(403, "Insufficient permissions");
   	}
   	return {};
   };
   ```

5. **Create `src/routes/(protected)/instructor/+layout.server.ts`**
   ```ts
   import { error } from "@sveltejs/kit";
   import type { LayoutServerLoad } from "./$types";

   export const load: LayoutServerLoad = async ({ parent }) => {
   	const { user } = await parent();
   	if (user?.role !== "instructor" && user?.role !== "admin" && user?.role !== "editor") {
   		throw error(403, "Insufficient permissions");
   	}
   	return {};
   };
   ```

6. **Create stub `src/routes/(protected)/learn/+layout.server.ts`**
   ```ts
   import type { LayoutServerLoad } from "./$types";

   export const load: LayoutServerLoad = async ({ parent }) => {
   	const { user } = await parent();
   	return { user };
   };
   ```
   (Will be filled with freemium/access logic in Wave 3.)

7. **Move auth routes to `(public)/`**
   - `mv src/routes/signin src/routes/(public)/signin`
   - `mv src/routes/signup src/routes/(public)/signup`
   - `mv src/routes/forgot-password src/routes/(public)/forgot-password`
   - `mv src/routes/reset-password src/routes/(public)/reset-password`

8. **Move markdown routes to `(public)/(markdown)/`**
   - `mv src/routes/(markdown) src/routes/(public)/(markdown)`

9. **Update all internal links** — search for `/dashboard`, `/signin`, `/terms`, `/privacy`, `/marketing` references in components and adjust paths if needed (SvelteKit should resolve within route groups automatically, but explicit `resolve()` calls may need updating).

**Commit:**
```
feat: restructure routes into (protected) and (public) groups with RBAC guards
```

**Verification:**
- Unauthenticated user → `/dashboard` redirects to `/signin`
- Authenticated user → `/dashboard` loads
- Student → `/admin` returns 403
- Admin → `/admin` loads
- `/signin` and `/signup` are accessible without auth
- Onboarding guard still works (hooks.server.ts unchanged)

---

### 1c — Refactor Pages to Use `useUser()`

**Step-by-step:**

1. **`(protected)/dashboard/+layout.svelte`** — currently just `{@render children()}`. Import `useUser()` if sidebar needs user info.

2. **`(protected)/dashboard/+page.svelte`** — Replace `let { data } = $props()` with `const { current } = useUser();` and use `current.name`, `current.id` directly.

3. **`(protected)/dashboard/settings/+page.svelte`** — Same pattern.

4. **`(protected)/dashboard/admin/role-requests/`** — Same pattern.

5. Any other components that extract `data.user` from props.

**Commit:**
```
refactor: replace prop-drilled session data with useUser() context
```

**Verification:**
- All dashboard pages render correctly with session data
- No `let { data }` patterns remain in dashboard components

---

## Wave 2: Infrastructure Layer

**Estimate:** 1 session  
**Concept:** Two fully independent tasks — monitoring and storage. Can be done in any order.

### 2a — Sentry Monitoring

**Files to create/modify:**

| File | Action |
|------|--------|
| `.env` | MODIFY (add `SENTRY_DSN` and optional `SENTRY_AUTH_TOKEN`) |
| `src/hooks.server.ts` | MODIFY (add Sentry handle) |
| `src/hooks.client.ts` | CREATE or MODIFY |
| `svelte.config.js` | MODIFY (add source maps) |
| `vite.config.ts` | MODIFY (add Sentry Vite plugin) |
| `package.json` | MODIFY (add scripts for source maps upload) |

**Step-by-step:**

1. Install Sentry SDK
   ```bash
   pnpm add @sentry/sveltekit
   ```

2. Run the setup wizard (or configure manually):
   ```bash
   npx @sentry/wizard -i sveltekit
   ```
   If wizard is unavailable, configure manually:

3. **Create `src/hooks.client.ts`**
   ```ts
   import { init } from "@sentry/sveltekit";
   import { env } from "$env/dynamic/public";

   init({
   	dsn: env.PUBLIC_SENTRY_DSN,
   	tracesSampleRate: 1.0,
   });
   ```

4. **Modify `src/hooks.server.ts`**
   - Import Sentry handle
   - Wrap with `sentryHandle()` from `@sentry/sveltekit`
   - Add optional `handleError` for server-side error tracking

5. **Modify `vite.config.ts`** — Add `sentrySvelteKit()` Vite plugin.

6. **Modify `svelte.config.js`** — Add `sourcemap: true` to `compilerOptions` if needed.

7. **Add env vars:**
   - `PUBLIC_SENTRY_DSN` — your Sentry DSN
   - `SENTRY_AUTH_TOKEN` — for source maps (optional in dev)

**Commit:**
```
feat: add Sentry error monitoring with source maps
```

**Verification:**
- Add a temporary `throw new Error("Sentry test")` in a route → error appears in Sentry dashboard
- Remove the test error
- Source maps are generated in build output

---

### 2b — Storage Adapter (R2 + Supabase via AWS SDK)

**Files to create/modify:**

| File | Action |
|------|--------|
| `src/lib/server/storage/types.ts` | CREATE |
| `src/lib/server/storage/s3-adapter.ts` | CREATE |
| `src/lib/server/storage/index.ts` | CREATE |
| `src/routes/api/storage/presign/+server.ts` | CREATE |
| `.env` | MODIFY (add storage env vars) |

**Step-by-step:**

1. **Install dependency**
   ```bash
   pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

2. **Define the interface `src/lib/server/storage/types.ts`**
   ```ts
   export interface StorageAdapter {
   	getUploadUrl(params: {
   		filename: string;
   		contentType: string;
   		size: number;
   	}): Promise<{ uploadUrl: string; publicUrl: string }>;
   	getPublicUrl(key: string): string;
   }
   ```

3. **Implement `src/lib/server/storage/s3-adapter.ts`**
   ```ts
   import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
   import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
   import { env } from "$env/dynamic/private";
   import type { StorageAdapter } from "./types";

   export class S3CompatibleAdapter implements StorageAdapter {
   	private client: S3Client;
   	private bucket: string;
   	private publicDomain: string;

   	constructor() {
   		this.client = new S3Client({
   			region: env.STORAGE_REGION,
   			endpoint: env.STORAGE_ENDPOINT || undefined, // R2 requires custom endpoint
   			credentials: {
   				accessKeyId: env.STORAGE_ACCESS_KEY_ID!,
   				secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY!,
   			},
   			forcePathStyle: env.STORAGE_PROVIDER === "r2", // R2 needs path-style
   		});
   		this.bucket = env.STORAGE_BUCKET_NAME!;
   		this.publicDomain = env.STORAGE_PUBLIC_DOMAIN!;
   	}

   	async getUploadUrl({ filename, contentType, size }: { filename: string; contentType: string; size: number }) {
   		// 200MB limit
   		if (size > 200 * 1024 * 1024) {
   			throw new Error("File exceeds maximum allowed size of 200MB");
   		}

   		const key = `courses/assets/${crypto.randomUUID()}-${filename}`;
   		const command = new PutObjectCommand({
   			Bucket: this.bucket,
   			Key: key,
   			ContentType: contentType,
   		});

   		const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 900 });

   		return {
   			uploadUrl,
   			publicUrl: `https://${this.publicDomain}/${key}`,
   		};
   	}

   	getPublicUrl(key: string): string {
   		return `https://${this.publicDomain}/${key}`;
   	}
   }
   ```

4. **Create `src/lib/server/storage/index.ts`**
   ```ts
   import { env } from "$env/dynamic/private";
   import type { StorageAdapter } from "./types";
   import { S3CompatibleAdapter } from "./s3-adapter";

   let _adapter: StorageAdapter | null = null;

   export function getStorage(): StorageAdapter {
   	if (!_adapter) {
   		const provider = env.STORAGE_PROVIDER || "r2";
   		switch (provider) {
   			case "r2":
   			case "supabase":
   				_adapter = new S3CompatibleAdapter();
   				break;
   			default:
   				throw new Error(`Unknown STORAGE_PROVIDER: ${provider}`);
   		}
   	}
   	return _adapter;
   }
   ```

5. **Create `src/routes/api/storage/presign/+server.ts`**
   ```ts
   import { error, json } from "@sveltejs/kit";
   import type { RequestHandler } from "./$types";
   import { getStorage } from "$lib/server/storage";
   import { requireCan } from "$lib/server/authorize";

   export const POST: RequestHandler = async ({ request, locals }) => {
   	if (!locals.session || !locals.user) {
   		throw error(401, "Authentication required");
   	}

   	requireCan(locals.user, "course", "create");

   	const { filename, contentType, size } = await request.json();

   	if (!filename || !contentType || typeof size !== "number") {
   		throw error(400, "Missing required fields: filename, contentType, size");
   	}

   	try {
   		const result = await getStorage().getUploadUrl({ filename, contentType, size });
   		return json(result);
   	} catch (err) {
   		if (err instanceof Error && err.message.includes("exceeds maximum")) {
   			throw error(400, err.message);
   		}
   		throw error(500, "Failed to generate upload URL");
   	}
   };
   ```

6. **Add env vars to `.env`:**
   ```env
   # Storage (R2 or Supabase S3-mode)
   STORAGE_PROVIDER=r2              # "r2" | "supabase"
   STORAGE_ACCESS_KEY_ID=
   STORAGE_SECRET_ACCESS_KEY=
   STORAGE_BUCKET_NAME=
   STORAGE_REGION=auto              # R2 uses "auto"; Supabase uses your region
   STORAGE_ENDPOINT=                # Required for R2 (e.g., https://<account>.r2.cloudflarestorage.com)
   STORAGE_PUBLIC_DOMAIN=           # e.g., <account>.r2.dev or Supabase project URL
   ```

**Commit:**
```
feat: add S3-compatible storage adapter with presigned URL endpoint
```

**Verification:**
- `POST /api/storage/presign` with valid auth + `requireCan` returns `{ uploadUrl, publicUrl }`
- `POST /api/storage/presign` without auth returns 401
- `POST /api/storage/presign` as student (no "course:create") returns 403
- `POST /api/storage/presign` with `size > 200MB` returns 400
- Switch `STORAGE_PROVIDER=supabase` → endpoint still works (same SDK, different config)

---

## Wave 3: Product Layer — The MVP

**Estimate:** 4-6 sessions  
**Concept:** One schema migration, one access model. All sub-steps modify the same files, so they're done as one unit.

### 3a — All New Database Schemas (Single Migration)

**Step-by-step:**

1. **Append to `src/lib/server/db/schema.ts`** — Add the following tables:

   **courses**
   ```ts
   export const courses = pgTable("courses", {
   	id: text("id").primaryKey(),
   	title: text("title").notNull(),
   	description: text("description"),
   	slug: text("slug").notNull().unique(),
   	thumbnail: text("thumbnail"),
   	isPublished: boolean("is_published").default(false).notNull(),
   	price: integer("price").notNull(), // in cents (e.g. 2999 = R$29.99)
   	freemiumLimit: integer("freemium_limit"), // null = no freemium access
   	createdAt: timestamp("created_at").defaultNow().notNull(),
   	updatedAt: timestamp("updated_at").defaultNow().notNull(),
   });
   ```

   **modules**
   ```ts
   export const modules = pgTable("modules", {
   	id: text("id").primaryKey(),
   	courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
   	title: text("title").notNull(),
   	description: text("description"),
   	order: integer("order").notNull(),
   	createdAt: timestamp("created_at").defaultNow().notNull(),
   });
   ```

   **lessons**
   ```ts
   export const lessons = pgTable("lessons", {
   	id: text("id").primaryKey(),
   	moduleId: text("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
   	title: text("title").notNull(),
   	description: text("description"),
   	order: integer("order").notNull(),
   	createdAt: timestamp("created_at").defaultNow().notNull(),
   });
   ```

   **learning_blocks**
   ```ts
   export const learningBlocks = pgTable("learning_blocks", {
   	id: text("id").primaryKey(),
   	lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
   	type: text("type").notNull(), // 'video', 'reading', 'code', 'excel', 'dragdrop', 'graphic', 'quiz'
   	config: jsonb("config").notNull(), // provider-specific content config
   	order: integer("order").notNull(),
   	points: integer("points").default(100).notNull(),
   	createdAt: timestamp("created_at").defaultNow().notNull(),
   });
   ```

   **enrollments** (supports both freemium and paid)
   ```ts
   export const enrollments = pgTable("enrollments", {
   	id: text("id").primaryKey(),
   	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
   	courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
   	status: text("status").default("freemium").notNull(), // 'freemium', 'active', 'completed'
   	freemiumLessonsViewed: integer("freemium_lessons_viewed").default(0).notNull(),
   	enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
   	updatedAt: timestamp("updated_at").defaultNow().notNull(),
   });
   // Unique constraint on (userId, courseId) — enforce one enrollment per user per course
   ```

   **payments**
   ```ts
   export const payments = pgTable("payments", {
   	id: text("id").primaryKey(),
   	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
   	courseId: text("course_id").notNull().references(() => courses.id),
   	gateway: text("gateway").notNull(), // 'lenco' | 'dodo'
   	gatewayReference: text("gateway_reference").notNull().unique(),
   	amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
   	currency: text("currency").notNull(),
   	status: text("status").notNull().default("pending"), // 'pending' | 'successful' | 'failed'
   	createdAt: timestamp("created_at").defaultNow().notNull(),
   });
   ```

   **user_progression**
   ```ts
   export const userProgression = pgTable("user_progression", {
   	userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
   	xp: integer("xp").default(0).notNull(),
   	level: integer("level").default(1).notNull(),
   	currentStreak: integer("current_streak").default(0).notNull(),
   	longestStreak: integer("longest_streak").default(0).notNull(),
   	lastActiveAt: timestamp("last_active_at"),
   });
   ```

   **block_completions**
   ```ts
   export const blockCompletions = pgTable("block_completions", {
   	id: text("id").primaryKey(),
   	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
   	blockId: text("block_id").notNull().references(() => learningBlocks.id, { onDelete: "cascade" }),
   	lessonId: text("lesson_id").notNull(),
   	completedAt: timestamp("completed_at").defaultNow().notNull(),
   });
   // Unique constraint on (userId, blockId) — each block completed once
   ```

2. **Update Drizzle schema exports**
   - `schema.ts` must re-export all new tables alongside existing ones

3. **Push migration**
   ```bash
   pnpm db:push
   ```

4. **Add unique composite indexes** if not using `unique()` on table columns directly:
   ```ts
   // After table definitions:
   import { uniqueIndex } from "drizzle-orm/pg-core";
   // For enrollments: unique on (userId, courseId)
   // For block_completions: unique on (userId, blockId)
   ```

**Commit:**
```
feat: add course content, payment, enrollment, and gamification schemas
```

**Verification:**
- `pnpm db:push` completes without errors
- All 7 new tables exist in Neon with correct columns and relationships

---

### 3b — Payment Webhook (Lenco + Dodo)

**Files to create/modify:**

| File | Action |
|------|--------|
| `src/routes/api/webhooks/payments/+server.ts` | CREATE |
| `src/lib/inngest/functions.ts` | MODIFY (add `processPaymentFulfillment`) |
| `src/routes/api/inngest/+server.ts` | MODIFY (register new function) |
| `.env` | MODIFY (add webhook secret env vars) |

**Step-by-step:**

1. **Create `src/routes/api/webhooks/payments/+server.ts`**
   ```ts
   import { error, json } from "@sveltejs/kit";
   import type { RequestHandler } from "./$types";
   import { env } from "$env/dynamic/private";
   import { db } from "$lib/server/db";
   import { payments } from "$lib/server/db/schema";
   import { sendInngestEvent } from "$lib/inngest/client";
   import crypto from "node:crypto";

   function verifyHmac(body: string, signature: string | null, secret: string): boolean {
   	if (!signature) return false;
   	const computed = crypto.createHmac("sha256", secret).update(body).digest("hex");
   	if (computed.length !== signature.length) return false;
   	return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
   }

   export const POST: RequestHandler = async ({ request, url }) => {
   	const rawBody = await request.text();
   	const provider = url.searchParams.get("provider"); // "lenco" | "dodo"

   	if (provider !== "lenco" && provider !== "dodo") {
   		throw error(400, "Invalid or missing provider parameter");
   	}

   	const secret = provider === "lenco" ? env.LENCO_WEBHOOK_SECRET : env.DODO_WEBHOOK_SECRET;
   	const signature = request.headers.get(
   		provider === "lenco" ? "x-lenco-signature" : "x-dodo-signature",
   	);

   	if (!secret || !verifyHmac(rawBody, signature, secret)) {
   		throw error(401, "Invalid webhook signature");
   	}

   	const payload = JSON.parse(rawBody);
   	const reference = provider === "lenco" ? payload.data.reference : payload.transaction.id;
   	const amount = provider === "lenco" ? payload.data.amount : payload.transaction.amount;
   	const currency = provider === "lenco" ? payload.data.currency : payload.transaction.currency;
   	const metadata = provider === "lenco" ? payload.data.metadata : payload.transaction.metadata;

   	try {
   		// Idempotency lock: insert with onConflictDoNothing
   		await db.insert(payments).values({
   			userId: metadata.userId,
   			courseId: metadata.courseId,
   			gateway: provider,
   			gatewayReference: reference,
   			amount: amount.toString(),
   			currency: currency,
   			status: "pending",
   		}).onConflictDoNothing();

   		// Handoff to Inngest for async fulfillment
   		await sendInngestEvent("payment/process.fulfillment", {
   			reference,
   			gateway: provider,
   			userId: metadata.userId,
   			courseId: metadata.courseId,
   			email: metadata.email,
   		});

   		return json({ received: true }, { status: 200 });
   	} catch (err) {
   		console.error("[webhook] Payment processing error:", err);
   		throw error(500, "Internal processing error");
   	}
   };
   ```

2. **Add `processPaymentFulfillment` to `src/lib/inngest/functions.ts`**
   ```ts
   export const processPaymentFulfillment = inngest.createFunction(
   	{
   		id: "payment-fulfillment",
   		retry: 3,
   	},
   	{ event: "payment/process.fulfillment" },
   	async ({ event, step }) => {
   		const { reference, gateway, userId, courseId, email } = event.data;

   		// Step 1: Mark payment as successful
   		await step.run("update-payment-status", async () => {
   			return await db.update(payments)
   				.set({ status: "successful" })
   				.where(eq(payments.gatewayReference, reference));
   		});

   		// Step 2: Upsert enrollment — change from 'freemium' to 'active', or create new
   		await step.run("upsert-enrollment", async () => {
   			const { sql } = await import("drizzle-orm");
   			return await db.insert(enrollments).values({
   				id: `enr-${crypto.randomUUID()}`,
   				userId,
   				courseId,
   				status: "active",
   				freemiumLessonsViewed: 0,
   			}).onConflictDoUpdate({
   				target: [/* composite unique on userId, courseId */],
   				set: { status: "active" },
   			});
   		});

   		// Step 3: Initialize progression
   		await step.run("init-progression", async () => {
   			return await db.insert(userProgression).values({
   				userId,
   				xp: 100,
   				level: 1,
   				currentStreak: 1,
   			}).onConflictDoNothing();
   		});

   		// Step 4: Send receipt email
   		if (email) {
   			await step.run("send-receipt", async () => {
   				await sendInngestEvent("app/email.send", {
   					type: "welcome", // Reuse welcome template or create a dedicated receipt
   					data: { email, name: "Student" },
   				});
   			});
   		}
   	},
   );
   ```
   Note: The `onConflictDoUpdate` needs the actual unique columns. Drizzle handles this differently depending on how you define the unique constraint. You may need to use `sql` raw query or adjust the approach.

3. **Register in `src/routes/api/inngest/+server.ts`**
   - Import `processPaymentFulfillment`
   - Add to the `functions` array

4. **Add env vars:**
   ```env
   LENCO_WEBHOOK_SECRET=
   DODO_WEBHOOK_SECRET=
   ```

**Commit:**
```
feat: add payment webhook endpoint and Inngest fulfillment worker
```

**Verification:**
- Send a test POST to `/api/webhooks/payments?provider=lenco` with HMAC-signed payload → returns 200
- Send with invalid signature → returns 401
- Payment record appears in database with status "pending"
- Inngest event fires (check Inngest dashboard in dev mode)

---

### 3c — Freemium Access Guard

**Files to create/modify:**

| File | Action |
|------|--------|
| `src/routes/(protected)/learn/+layout.server.ts` | MODIFY (add access logic) |
| `src/lib/server/access.ts` | CREATE |
| `src/routes/api/learn/progress/+server.ts` | CREATE |

**Step-by-step:**

1. **Create `src/lib/server/access.ts`** — Freemium access helper
   ```ts
   import { and, eq } from "drizzle-orm";
   import { db } from "$lib/server/db";
   import { courses, enrollments } from "$lib/server/db/schema";

   export async function checkCourseAccess(userId: string, courseId: string) {
   	const [course, enrollment] = await Promise.all([
   		db.select().from(courses).where(eq(courses.id, courseId)).limit(1),
   		db.select().from(enrollments).where(
   			and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
   		).limit(1),
   	]);

   	if (!course.length) {
   		return { allowed: false, reason: "not-found" as const };
   	}

   	const courseData = course[0];
   	const enrollmentData = enrollment[0];

   	// Paid or free course — full access
   	if (enrollmentData?.status === "active" || courseData.price === 0) {
   		return { allowed: true };
   	}

   	// Freemium access
   	if (courseData.freemiumLimit !== null && !isNaN(courseData.freemiumLimit)) {
   		const viewed = enrollmentData?.freemiumLessonsViewed ?? 0;
   		if (viewed >= courseData.freemiumLimit) {
   			return {
   				allowed: false,
   				reason: "freemium-limit" as const,
   				freemiumLimit: courseData.freemiumLimit,
   				freemiumLessonsViewed: viewed,
   			};
   		}
   		return { allowed: true, freemiumRemaining: courseData.freemiumLimit - viewed };
   	}

   	// No freemium and no enrollment — blocked
   	return { allowed: false, reason: "not-enrolled" as const };
   }

   export async function incrementFreemiumCounter(userId: string, courseId: string) {
   	return await db.insert(enrollments).values({
   		id: `enr-${crypto.randomUUID()}`,
   		userId,
   		courseId,
   		status: "freemium",
   		freemiumLessonsViewed: 1,
   	}).onConflictDoUpdate({
   		target: /* composite unique on userId, courseId */,
   		set: { freemiumLessonsViewed: sql`${enrollments.freemiumLessonsViewed} + 1` },
   	});
   }
   ```
   (Adjust the `onConflictDoUpdate` target based on actual unique constraint definition.)

2. **Update `(protected)/learn/+layout.server.ts`**
   ```ts
   import { error } from "@sveltejs/kit";
   import type { LayoutServerLoad } from "./$types";
   import { checkCourseAccess } from "$lib/server/access";

   export const load: LayoutServerLoad = async ({ params, locals }) => {
   	const courseId = params.courseId;
   	if (!courseId || !locals.user) {
   		throw error(400, "Missing course or user");
   	}

   	const access = await checkCourseAccess(locals.user.id, courseId);

   	if (!access.allowed) {
   		if (access.reason === "freemium-limit") {
   			throw error(403, {
   				message: "Free preview limit reached. Purchase to continue.",
   				freemiumLimit: access.freemiumLimit,
   				freemiumLessonsViewed: access.freemiumLessonsViewed,
   				code: "FREEMIUM_LIMIT",
   			});
   		}
   		if (access.reason === "not-enrolled") {
   			throw error(403, {
   				message: "You are not enrolled in this course.",
   				code: "NOT_ENROLLED",
   			});
   		}
   		throw error(404, "Course not found");
   	}

   	return { access };
   };
   ```

3. **Create `src/routes/api/learn/progress/+server.ts`** — Increment counter + progress tracking
   ```ts
   import { error, json } from "@sveltejs/kit";
   import type { RequestHandler } from "./$types";
   import { incrementFreemiumCounter, checkCourseAccess } from "$lib/server/access";

   export const POST: RequestHandler = async ({ request, locals }) => {
   	if (!locals.user) throw error(401, "Authentication required");

   	const { courseId } = await request.json();
   	const access = await checkCourseAccess(locals.user.id, courseId);

   	if (!access.allowed) {
   		throw error(403, "Access denied");
   	}

   	// Only increment for freemium users
   	if ("freemiumRemaining" in access && access.freemiumRemaining !== undefined) {
   		await incrementFreemiumCounter(locals.user.id, courseId);
   	}

   	return json({ ok: true });
   };
   ```

4. **Freemium purchase CTA component**
   - Create `src/lib/components/PurchaseCTA.svelte` — shown when access is denied due to `FREEMIUM_LIMIT`
   - Displays: "You've viewed N of M free lessons. Purchase to unlock the full course."
   - Includes payment button (to be wired in later iterations)

**Commit:**
```
feat: add freemium access guard with lesson counter and purchase CTA
```

**Verification:**
- Unauthenticated user → `/learn/[courseId]` redirects to `/signin` (from protected group)
- Authenticated user, not enrolled, no freemium → 403 "not enrolled"
- Authenticated user, within freemium limit → lesson loads
- Authenticated user, past freemium limit → 403 "free preview limit reached"
- Authenticated user with active enrollment → full access regardless of counter

---

### 3d — Course Catalog + Lesson Player

**Files to create/modify:**

| File | Action |
|------|--------|
| `src/routes/(public)/catalog/+page.server.ts` | CREATE |
| `src/routes/(public)/catalog/+page.svelte` | CREATE |
| `src/routes/(public)/catalog/[slug]/+page.server.ts` | CREATE |
| `src/routes/(public)/catalog/[slug]/+page.svelte` | CREATE |
| `src/routes/(protected)/learn/[courseId]/[lessonId]/+page.server.ts` | CREATE |
| `src/routes/(protected)/learn/[courseId]/[lessonId]/+page.svelte` | CREATE |
| `src/lib/components/blocks/BlockDispatcher.svelte` | CREATE |
| `src/lib/components/blocks/VideoBlock.svelte` | CREATE |
| `src/lib/components/blocks/ReadingBlock.svelte` | CREATE |

**Step-by-step:**

1. **Create `(public)/catalog/+page.server.ts`**
   ```ts
   import type { PageServerLoad } from "./$types";
   import { db } from "$lib/server/db";
   import { courses } from "$lib/server/db/schema";
   import { eq } from "drizzle-orm";

   export const load: PageServerLoad = async () => {
   	const allCourses = await db.select().from(courses).where(eq(courses.isPublished, true));
   	return { courses: allCourses };
   };
   ```

2. **Create `(public)/catalog/+page.svelte`** — Grid of course cards with title, description, price, thumbnail

3. **Create `(public)/catalog/[slug]/+page.server.ts`**
   ```ts
   import { error } from "@sveltejs/kit";
   import type { PageServerLoad } from "./$types";
   import { db } from "$lib/server/db";
   import { courses, modules, lessons } from "$lib/server/db/schema";
   import { eq, asc } from "drizzle-orm";

   export const load: PageServerLoad = async ({ params }) => {
   	const slug = params.slug;

   	const [course] = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
   	if (!course) throw error(404, "Course not found");

   	const courseModules = await db.select()
   		.from(modules)
   		.where(eq(modules.courseId, course.id))
   		.orderBy(asc(modules.order));

   	const moduleIds = courseModules.map(m => m.id);
   	const allLessons = moduleIds.length > 0
   		? await db.select().from(lessons).where(sql`${lessons.moduleId} IN (${moduleIds.join(",")})`).orderBy(asc(lessons.order))
   		: [];

   	return { course, modules: courseModules, lessons: allLessons };
   };
   ```

4. **Create `(public)/catalog/[slug]/+page.svelte`** — Course detail page with module/lesson tree, enroll button

5. **Create `(protected)/learn/[courseId]/[lessonId]/+page.server.ts`**
   ```ts
   import { error } from "@sveltejs/kit";
   import type { PageServerLoad } from "./$types";
   import { db } from "$lib/server/db";
   import { lessons, learningBlocks } from "$lib/server/db/schema";
   import { eq, asc } from "drizzle-orm";

   export const load: PageServerLoad = async ({ params }) => {
   	const [lesson] = await db.select().from(lessons).where(eq(lessons.id, params.lessonId)).limit(1);
   	if (!lesson) throw error(404, "Lesson not found");

   	const blocks = await db.select()
   		.from(learningBlocks)
   		.where(eq(learningBlocks.lessonId, lesson.id))
   		.orderBy(asc(learningBlocks.order));

   	return { lesson, blocks };
   };
   ```

6. **Create `BlockDispatcher.svelte`**
   ```svelte
   <script lang="ts">
   	import VideoBlock from "./VideoBlock.svelte";
   	import ReadingBlock from "./ReadingBlock.svelte";
   	import CodeBlock from "./CodeBlock.svelte";

   	let { blocks, onComplete } = $props<{
   		blocks: Array<{ id: string; type: string; config: any; points: number }>;
   		onComplete: (blockId: string, points: number) => void;
   	}>();
   </script>

   {#each blocks as block (block.id)}
   	<div class="block-container mb-6 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 backdrop-blur-md">
   		{#if block.type === "video"}
   			<VideoBlock config={block.config} onComplete={() => onComplete(block.id, block.points)} />
   		{:else if block.type === "reading"}
   			<ReadingBlock config={block.config} onComplete={() => onComplete(block.id, block.points)} />
   		{:else if block.type === "code"}
   			<CodeBlock config={block.config} onComplete={() => onComplete(block.id, block.points)} />
   		{:else}
   			<p class="text-zinc-500">Unknown block type: {block.type}</p>
   		{/if}
   	</div>
   {/each}
   ```

7. **Create `VideoBlock.svelte`** — Video player using hls.js or native `<video>` with config.src

8. **Create `ReadingBlock.svelte`** — Renders markdown/HTML content from config.content

**Commit:**
```
feat: add course catalog, detail page, and lesson player with block dispatcher
```

**Verification:**
- `/catalog` shows published courses
- Clicking a course shows modules/lessons tree
- Clicking a lesson loads the lesson player
- Blocks render according to their type
- Protected route guard works for `(protected)/learn/[courseId]/[lessonId]/`

---

### 3e — E2B Code Sandbox

**Files to create/modify:**

| File | Action |
|------|--------|
| `src/routes/api/compute/run/+server.ts` | CREATE |
| `src/lib/components/blocks/CodeBlock.svelte` | CREATE |
| `.env` | MODIFY (add `E2B_API_KEY`) |

**Step-by-step:**

1. **Install dependency**
   ```bash
   pnpm add @e2b/code-snippet
   ```

2. **Create `src/routes/api/compute/run/+server.ts`**
   ```ts
   import { error } from "@sveltejs/kit";
   import type { RequestHandler } from "./$types";
   import { Sandbox } from "@e2b/code-snippet";
   import { env } from "$env/dynamic/private";

   export const POST: RequestHandler = async ({ request, locals }) => {
   	if (!locals.session) {
   		throw error(401, "Authentication required");
   	}

   	const { code, language } = await request.json() as { code: string; language?: string };
   	const lang = language || "python";
   	const filename = lang === "js" || lang === "javascript" ? "index.js" : "main.py";

   	const stream = new ReadableStream({
   		async start(controller) {
   			const encoder = new TextEncoder();
   			const sendEvent = (event: string, data: unknown) => {
   				controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
   			};

   			try {
   				sendEvent("status", { message: "Provisioning sandbox..." });

   				const box = await Sandbox.create({
   					template: lang,
   					apiKey: env.E2B_API_KEY,
   				});

   				sendEvent("status", { message: "Writing code..." });
   				await box.files.write(filename, code);

   				sendEvent("status", { message: "Running..." });
   				const process = await box.process.start({
   					cmd: lang === "js" ? `node ${filename}` : `python3 ${filename}`,
   					onStdout: (chunk) => sendEvent("stdout", { output: chunk.line }),
   					onStderr: (chunk) => sendEvent("stderr", { output: chunk.line }),
   					timeout: 10_000,
   				});

   				await process.finished;
   				sendEvent("status", { message: "Execution complete." });
   				await box.close();
   				controller.close();
   			} catch (err: unknown) {
   				const message = err instanceof Error ? err.message : "Unknown execution error";
   				sendEvent("error", { message });
   				controller.close();
   			}
   		},
   	});

   	return new Response(stream, {
   		headers: {
   			"Content-Type": "text/event-stream",
   			"Cache-Control": "no-cache",
   			"Connection": "keep-alive",
   		},
   	});
   };
   ```

3. **Create `src/lib/components/blocks/CodeBlock.svelte`**
   - Textarea/code editor input
   - Language selector (JS/Python)
   - "Run" button → GET/POST to `/api/compute/run`
   - EventSource or fetch SSE reader for streaming output
   - Renders stdout + stderr in real-time
   - Shows status messages
   - Error display

4. **Add `E2B_API_KEY` to `.env`**

**Commit:**
```
feat: add E2B code sandbox SSE endpoint and CodeBlock component
```

**Verification:**
- Submit Python code → stdout streams back in real-time
- Submit invalid syntax → stderr shows error
- Wrong language selected → appropriate error
- Unauthenticated request → 401
- `/api/compute/run` correctly uses file-write execution (not bash injection)

---

### 3f — Gamification (XP, Streaks, Levels)

**Files to create/modify:**

| File | Action |
|------|--------|
| `src/routes/api/progress/complete/+server.ts` | CREATE |
| `src/lib/server/gamification.ts` | CREATE |

**Step-by-step:**

1. **Create `src/lib/server/gamification.ts`**
   ```ts
   import { and, eq, sql } from "drizzle-orm";
   import { db } from "$lib/server/db";
   import { userProgression, blockCompletions } from "$lib/server/db/schema";

   const XP_PER_LEVEL = 500;
   const STREAK_WINDOW_HOURS = 48;

   export async function completeBlock(userId: string, blockId: string, lessonId: string, points: number) {
   	// Check if already completed
   	const [existing] = await db.select()
   		.from(blockCompletions)
   		.where(and(eq(blockCompletions.userId, userId), eq(blockCompletions.blockId, blockId)))
   		.limit(1);

   	if (existing) {
   		return { alreadyCompleted: true };
   	}

   	// Record completion
   	await db.insert(blockCompletions).values({
   		id: crypto.randomUUID(),
   		userId,
   		blockId,
   		lessonId,
   	});

   	// Get or create progression
   	let [progression] = await db.select()
   		.from(userProgression)
   		.where(eq(userProgression.userId, userId))
   		.limit(1);

   	if (!progression) {
   		progression = { userId, xp: 0, level: 1, currentStreak: 0, longestStreak: 0, lastActiveAt: null };
   	}

   	const now = new Date();
   	let newStreak = progression.currentStreak;

   	// Check streak
   	if (progression.lastActiveAt) {
   		const hoursSinceLast = (now.getTime() - new Date(progression.lastActiveAt).getTime()) / (1000 * 60 * 60);
   		if (hoursSinceLast <= STREAK_WINDOW_HOURS) {
   			newStreak += 1;
   		} else {
   			newStreak = 1; // Streak broken
   		}
   	} else {
   		newStreak = 1;
   	}

   	const newXp = progression.xp + points;
   	const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
   	const leveledUp = newLevel > progression.level;

   	await db.insert(userProgression).values({
   		userId,
   		xp: newXp,
   		level: newLevel,
   		currentStreak: newStreak,
   		longestStreak: Math.max(progression.longestStreak, newStreak),
   		lastActiveAt: now,
   	}).onConflictDoUpdate({
   		target: userProgression.userId,
   		set: {
   			xp: newXp,
   			level: newLevel,
   			currentStreak: newStreak,
   			longestStreak: Math.max(progression.longestStreak, newStreak),
   			lastActiveAt: now,
   		},
   	});

   	return {
   		xpEarned: points,
   		totalXp: newXp,
   		level: newLevel,
   		leveledUp,
   		currentStreak: newStreak,
   	};
   }
   ```
   (Note: `onConflictDoUpdate` target syntax depends on Drizzle version — adjust as needed.)

2. **Create `src/routes/api/progress/complete/+server.ts`**
   ```ts
   import { error, json } from "@sveltejs/kit";
   import type { RequestHandler } from "./$types";
   import { db } from "$lib/server/db";
   import { learningBlocks } from "$lib/server/db/schema";
   import { eq } from "drizzle-orm";
   import { completeBlock } from "$lib/server/gamification";

   export const POST: RequestHandler = async ({ request, locals }) => {
   	if (!locals.user) throw error(401, "Authentication required");

   	const { blockId, lessonId } = await request.json() as { blockId: string; lessonId: string };

   	const [block] = await db.select()
   		.from(learningBlocks)
   		.where(eq(learningBlocks.id, blockId))
   		.limit(1);

   	if (!block) throw error(404, "Block not found");

   	const result = await completeBlock(locals.user.id, blockId, lessonId, block.points);
   	return json(result);
   };
   ```

3. **Wire `onComplete` in lesson player** — The lesson page calls the progress API when a block is completed, then updates UI with XP feedback.

**Commit:**
```
feat: add gamification engine with XP, streaks, and level progression
```

**Verification:**
- Complete a block → XP is added, streak increments
- Complete the same block again → `alreadyCompleted: true`
- Complete blocks across days → streak logic works (broken after 48h, maintained within)
- XP crosses level threshold → `leveledUp: true`

---

### 3g — AI Tutor (NVIDIA NIM)

**Files to create/modify:**

| File | Action |
|------|--------|
| `src/routes/api/compute/tutor/+server.ts` | CREATE |
| `src/lib/components/blocks/CodeBlock.svelte` | MODIFY (add hint button) |
| `.env` | MODIFY (add `NVIDIA_NIM_API_KEY`) |

**Step-by-step:**

1. **Create `src/routes/api/compute/tutor/+server.ts`**
   ```ts
   import { error, json } from "@sveltejs/kit";
   import type { RequestHandler } from "./$types";
   import { env } from "$env/dynamic/private";

   export const POST: RequestHandler = async ({ request, locals }) => {
   	if (!locals.session) {
   		throw error(401, "Authentication required");
   	}

   	const { code, errorMessage, taskPrompt } = await request.json() as {
   		code: string;
   		errorMessage: string;
   		taskPrompt: string;
   	};

   	try {
   		const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
   			method: "POST",
   			headers: {
   				Authorization: `Bearer ${env.NVIDIA_NIM_API_KEY}`,
   				"Content-Type": "application/json",
   			},
   			body: JSON.stringify({
   				model: "meta/llama3-70b-instruct",
   				messages: [
   					{
   						role: "system",
   						content:
   							"You are Roviolt AI, an elite gamified coding coach. Provide concise, friendly hints to help the student solve their compilation/logic error. DO NOT give them the direct copy-paste answer outright; guide them on how to fix it.",
   					},
   					{
   						role: "user",
   						content: `Challenge Prompt: ${taskPrompt}\nStudent Code:\`\`\`\n${code}\n\`\`\`\nError Message:\n${errorMessage}`,
   					},
   				],
   				max_tokens: 250,
   				temperature: 0.2,
   			}),
   		});

   		const data = await response.json() as { choices: Array<{ message: { content: string } }> };
   		return json({ hint: data.choices[0].message.content });
   	} catch (err) {
   		throw error(500, "Failed to contact AI tutor service");
   	}
   };
   ```

2. **Update `CodeBlock.svelte`** — Add "Get AI Hint" button that:
   - Collects current code + any stderr output
   - Calls `POST /api/compute/tutor`
   - Displays the hint in an expandable panel below the editor
   - Is only visible when there's stderr output or the user explicitly asks

3. **Add `NVIDIA_NIM_API_KEY` to `.env`**

**Commit:**
```
feat: add AI tutor endpoint with NVIDIA NIM and hint UI in CodeBlock
```

**Verification:**
- Submit erroneous code → "Get AI Hint" button appears
- Click it → hint is returned (non-spoiler coaching)
- Valid code → no hint button (or inactive)

---

## Test Strategy

After each of the 3 waves, I will ask:
> "Write tests for this wave now?"

You answer "yes" or "no" (or "just unit" / "just e2e"). This keeps the decision close to the implementation while avoiding test debt.

Recommended test coverage per wave:

| Wave | Unit tests | E2E tests |
|------|-----------|-----------|
| Wave 1 | `useUser()` context resolves correctly, route guards redirect properly | Full auth flow: signup → signin → protected route → signout |
| Wave 2 | Storage adapter mock returns URL, Sentry init doesn't throw | Upload file via presigned URL, verify in bucket |
| Wave 3 | `checkCourseAccess` logic, `completeBlock` XP/streak math, `verifyHmac` | Course catalog → lesson player → block completion → XP update |

---

## Summary: Wave Map

```
Wave 1: Architecture Foundation
├── 1a: Root layout server + user.svelte.ts context
├── 1b: Route groups (protected/public) + RBAC guards
└── 1c: Refactor to useUser() everywhere

Wave 2: Infrastructure Layer
├── 2a: Sentry monitoring (parallel-safe)
└── 2b: Storage adapter + presign endpoint (parallel-safe)

Wave 3: Product Layer (MVP)
├── 3a: All new schemas (one migration)
├── 3b: Payment webhook + Inngest fulfillment
├── 3c: Freemium access guard
├── 3d: Course catalog + lesson player + BlockDispatcher
├── 3e: E2B code sandbox SSE endpoint
├── 3f: Gamification (XP, streaks, levels)
└── 3g: AI tutor (NVIDIA NIM)
```

Each wave is independently shippable. Ready to start Wave 1 whenever you are.
