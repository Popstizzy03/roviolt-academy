### Milestone Analysis: Phase 0 Verification

You have successfully executed a massive architectural migration: pulling down a distributed multi-tier layout (NestJS server, separate UI client, complex cross-domain cookie configurations) and consolidating it into a singular, high-performance **full-stack SvelteKit engine** built on Tailwind CSS v4, Better-Auth, and Neon/Drizzle.

Your `/api/inngest` endpoint is live, your session validation is securely bound inside `hooks.server.ts`, and your core database schemas are compiled and running on Neon. This sets a solid foundation for the remainder of your MVP build.

The upcoming phases must follow a strict, non-blocking asynchronous paradigm to keep your serverless compute thin, fast, and free from timeout limits. Here is your architectural master blueprint to build out the remaining infrastructure.

---

## Module 1: The Asynchronous Email Verification Flow (Inngest + Resend)

Because Better-Auth lacks an embedded mail transport loop, it delegates delivery via structural hooks. We intercept this loop inside SvelteKit to immediately offload it to Inngest, preventing the primary user request thread from locking up while waiting for the Resend API.

```
[User Form Submit] ──> [Better-Auth Hook] ──> [Inngest Client: Event Emitted (3ms)]
                                                         │
     ┌───────────────────────────────────────────────────┘
     ▼
[Inngest Cloud Service Engine] ──> [Worker Route Invoked Async]
                                             │
                                             ▼
                               [Resend HTTPS Payload Sent]

```

### 1. The Better-Auth Integration Loop

Update your authentication initialization engine (`src/lib/server/auth.ts`) to intercept registration events. Instead of executing API calls to Resend here, pass the metadata payload into your background network pool.

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/plugins/drizzle";
import { db } from "./db"; // Your active Drizzle context instance
import { inngest } from "./inngest/client"; // Your Inngest singleton instance

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true, 
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }) => {
            // Non-blocking handoff: Fires a microsecond event to Inngest
            await inngest.send({
                name: "auth/email.verify",
                data: {
                    email: user.email,
                    verificationUrl: url,
                    firstName: user.name.split(" ")[0] || "Learner"
                }
            });
        }
    }
});

```

### 2. The Asynchronous Worker Thread

Inside your background worker configuration (`src/lib/server/inngest/workers.ts`), map your event payload directly to your email template engine. This executes in an isolated serverless thread, decoupled from the active user session.

```typescript
import { inngest } from "./client";
import { Resend } from "resend";
import { VerifyEmailTemplate } from "../emails/VerifyEmail"; // Your pure TS string template

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmailWorker = inngest.createFunction(
    { 
        id: "send-verification-email",
        // Network protection: automatically backoff and retry if Resend experiences a momentary outage
        retry: 5 
    },
    { event: "auth/email.verify" },
    async ({ event }) => {
        const { email, verificationUrl, firstName } = event.data;

        await resend.emails.send({
            from: "Academy Terminal <auth@roviolt.com>",
            to: email,
            subject: "Verify your Academy Account",
            html: VerifyEmailTemplate({ firstName, verificationUrl })
        });

        return { success: true, deliveredTo: email };
    }
);

```

---

## Module 2: Dual-Gateway Financial Ingestion (Lenco + Dodo Webhooks)

When dealing with financial infrastructure across local (Lenco) and international (Dodo) gateways, processing payments within the active webhook request is highly dangerous. If your database write blocks or queries experience high latency, the gateway will assume a timeout, duplicate the webhook invocation, and trigger a double-provisioning vulnerability.

To prevent this, implement a **Validated Ingestion, Deferred Processing** architecture.

```
[Gateway Webhook POST] ──> [Validate HMAC Signature] ──> [Log Raw Event to DB] ──> [Emit Event to Inngest] ──> [Return 200 OK]
                                                                                                                │
                                   ┌────────────────────────────────────────────────────────────────────────────┘
                                   ▼
                       [Background Inngest Process]
                                   │
                                   ├──> [Acquire Idempotency Lock]
                                   └──> [Mutate Ledger & Grant Course Access]

```

### 1. Database Schema Definitions (`src/lib/server/db/schema.ts`)

We establish a resilient ledger configuration to store payment requests, preventing double-provisioning issues.

```typescript
import { pgTable, uuid, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema"; // Your existing Better-Auth user model

export const payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id),
    courseId: uuid("course_id").notNull(),
    gateway: text("gateway").notNull(), // 'lenco' or 'dodo'
    gatewayReference: text("gateway_reference").notNull().unique(), // Unique index for idempotency locks
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull().default("pending"), // 'pending', 'successful', 'failed'
    createdAt: timestamp("created_at").defaultNow().notNull()
});

```

### 2. The Universal Endpoint (`src/routes/api/webhooks/payments/+server.ts`)

This serverless endpoint intercepts incoming payment requests from both payment processors, verifies their identities cryptographically, logs the payload to the database, and hands execution over to Inngest before closing the server connection.

```typescript
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { payments } from "$lib/server/db/schema";
import { inngest } from "$lib/server/inngest/client";
import crypto from "node:crypto";

function verifyHmac(body: string, signature: string | null, secret: string): boolean {
    if (!signature) return false;
    const computed = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

export const POST: RequestHandler = async ({ request, url }) => {
    const rawBody = await request.text();
    const provider = url.searchParams.get("provider"); // e.g., /api/webhooks/payments?provider=lenco
    
    const secret = provider === "lenco" ? process.env.LENCO_WEBHOOK_SECRET : process.env.DODO_WEBHOOK_SECRET;
    const signature = request.headers.get(provider === "lenco" ? "x-lenco-signature" : "x-dodo-signature");

    if (!secret || !verifyHmac(rawBody, signature, secret)) {
        throw error(401, "Invalid cryptographic signature asset matching.");
    }

    const payload = JSON.parse(rawBody);
    
    // Normalize properties across both gateways
    const reference = provider === "lenco" ? payload.data.reference : payload.transaction.id;
    const amount = provider === "lenco" ? payload.data.amount : payload.transaction.amount;
    const currency = provider === "lenco" ? payload.data.currency : payload.transaction.currency;
    const customMetadata = provider === "lenco" ? payload.data.metadata : payload.transaction.metadata;

    try {
        // Step 1: Log transactional intent to your ledger using a write-safe guard
        const [paymentRecord] = await db.insert(payments).values({
            userId: customMetadata.userId,
            courseId: customMetadata.courseId,
            gateway: provider,
            gatewayReference: reference,
            amount: amount.toString(),
            currency: currency,
            status: "pending"
        }).onConflictDoNothing().returning();

        // Step 2: Handoff to background queue for user provisioning
        await inngest.send({
            name: "payment/process.fulfillment",
            data: {
                reference: reference,
                gateway: provider
            }
        });

        // Step 3: Fast release. Acknowledge delivery within 50ms
        return json({ received: true }, { status: 200 });
    } catch (err) {
        throw error(500, "Internal tracking ingestion breakdown.");
    }
};

```

---

## Module 3: Serverless Interactive Compute (E2B Sandbox SDK)

To execute student code securely, your application should run workloads inside micro-containers via the E2B SDK. Because code execution takes time, streaming output via Server-Sent Events (SSE) ensures a responsive frontend experience without hanging your serverless connections.

```
[Student Editor UI] ──> [SvelteKit API Stream Route] ──> [E2B Sandbox Allocation]
         ▲                                                           │
         └───────────── [SSE Chunk Stream Streamed Live] <───────────┘

```

### 1. The Real-Time SSE Endpoint (`src/routes/api/compute/run/+server.ts`)

This API endpoint spins up an isolated sandbox environment, runs the student's code, and streams the standard output chunks back to the client interface in real time.

```typescript
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Sandbox } from "@e2b/code-snippet";

export const POST: RequestHandler = async ({ request, locals }) => {
    // Structural Guard: Limit execution strictly to authenticated active profiles
    if (!locals.session) throw error(401, "Unauthorized computational execution request.");

    const { code, language } = await request.json();

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            
            // Local closure to handle data serialization into standard SSE streams
            const sendEvent = (event: string, data: any) => {
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            };

            try {
                sendEvent("status", { message: "Provisioning container infrastructure..." });
                const box = await Sandbox.create({ template: language || "python" });
                
                sendEvent("status", { message: "Running script runtime optimization..." });
                
                // Initialize the code snippet execution tracking process
                const processExecution = await box.process.start({
                    cmd: language === "js" ? `node -e "${code.replace(/"/g, '\\"')}"` : `python3 -c "${code.replace(/"/g, '\\"')}"`,
                    onStdout: (chunk) => sendEvent("stdout", { output: chunk.line }),
                    onStderr: (chunk) => sendEvent("stderr", { output: chunk.line })
                });

                await processExecution.finished;
                sendEvent("status", { message: "Execution sequence wrapped cleanly." });
                await box.close();
                controller.close();
            } catch (err: any) {
                sendEvent("error", { message: err.message || "Runtime exception crash." });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    });
};

```

---

## Module 4: Zero-Compute Heavy Storage Pipelines (S3 Presigned URLs)

To keep your serverless functions performant, large files (such as course videos or student assignments) should bypass the SvelteKit compute layer completely. Instead, your server generates a short-lived cryptographically presigned URL, allowing the client to upload files directly to AWS S3 or Cloudflare R2 securely.

```
[Instructor UI] ──> [Requests Presigned URL] ──> [SvelteKit Server generates URL (3ms)]
       │                                                         │
       ├────────────────── <────────────── <─────────────────────┘
       ▼
[Client Uploads Binary Object Direct to Bucket S3/R2]

```

### 1. The Presigned URL Generator (`src/routes/api/storage/presign/+server.ts`)

This serverless component authenticates the user, validates their permissions, and requests an upload lease directly from your object storage system.

```typescript
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

export const POST: RequestHandler = async ({ request, locals }) => {
    // Security verification boundary
    if (!locals.session || locals.user.role !== "instructor") {
        throw error(403, "Forbidden file repository target modification request.");
    }

    const { filename, contentType, size } = await request.json();
    
    // Enforce payload boundaries at an execution level (e.g., 500MB maximum ceiling)
    if (size > 500 * 1024 * 1024) {
        throw error(400, "Object configuration exceeds system limits.");
    }

    const storageKey = `courses/assets/${crypto.randomUUID()}-${filename}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: storageKey,
        ContentType: contentType
    });

    // Generate a temporary 15-minute lease token
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    return json({
        uploadUrl,
        publicAssetUrl: `https://${process.env.AWS_CLOUDFRONE_DOMAIN}/${storageKey}`
    });
};

```

---

## Module 5: Svelte 5 Runes Global State Architecture

With your authentication context initialized directly via `hooks.server.ts` into `event.locals`, you need to pass this state down cleanly across the user interface. Svelte 5's fine-grained reactivity uses deep runes to keep your UI sync states decoupled and highly performant.

### 1. Root Layout Aggregator (`src/routes/+layout.server.ts`)

Map your active server auth states down into the global page data pipe.

```typescript
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        session: locals.session,
        user: locals.user // Returns profile schema data matching role, status, etc.
    };
};

```

### 2. Reactive Context Injected Context (`src/lib/client/state/user.svelte.ts`)

Construct a reactive profile state engine to provide global data across your view layer without relying on legacy store architectures.

```typescript
import { setContext, getContext } from "svelte";

class UserSessionState {
    // Deep tracking definitions using Svelte 5 runes
    #current = $state<{ id: string; email: string; role: string; name: string } | null>(null);

    constructor(initialState: any) {
        this.#current = initialState;
    }

    get current() { return this.#current; }
    get isAuthenticated() { return this.#current !== null; }
    get isAdmin() { return this.#current?.role === "admin"; }

    updateProfile(newData: any) {
        this.#current = { ...this.#current, ...newData };
    }
}

const CONTEXT_KEY = Symbol("USER_SESSION_STATE");

export function initUserContext(initialData: any) {
    return setContext(CONTEXT_KEY, new UserSessionState(initialData));
}

export function useUser() {
    const context = getContext<UserSessionState>(CONTEXT_KEY);
    if (!context) throw new Error("useUser invoked outside initialization layout context container.");
    return context;
}

```

### 3. Root Initializer Layout View (`src/routes/+layout.svelte`)

Initialize your global context container directly at the root view layer of your Svelte application.

```svelte
<script lang="typescript">
    import "../app.css";
    import { initUserContext } from "$lib/client/state/user.svelte";
    
    let { data, children } = $props();

    // Hydrate your reactive class state component with server layout mutations dynamically
    const sessionManager = initUserContext(data.user);
</script>

{@render children()}

```

---

## Action Plan for Your Dev Terminal

To execute this architecture cleanly, install the necessary dependencies via your package manager:

```bash
# Add storage and template libraries
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner resend

# Add isolated computation execution SDK
pnpm add @e2b/code-snippet
```

Your base setup is fully operational. Proceed with building out your background processing logic and payment hooks, using your direct `DIRECT_URL` connection parameters for schema updates and `DATABASE_URL` for high-concurrency app operations.

---

## Phase 0/1 Architecture Verification & Endpoint Strengthening

### 1. Verification of the Plan vs. Current Implementation

Our thorough review of your consolidated SvelteKit repository yields a clean verification. Phase 0 has been implemented successfully (Argon2 password verification, OAuth, grace-period account deletion, database migrations). Comparing the proposed post-phase-0 plan to your current codebase, we have identified several opportunities to **strengthen and simplify** your endpoints prior to launching:

*   **Better-Auth User ID Type Mismatch (Database Schema)**:
    In Module 2, the plan defines `userId: uuid("user_id").notNull().references(() => user.id)`. However, in your active `src/lib/server/db/schema.ts`, the Better-Auth `user` table uses a `text` primary key for its user ID (standard for Better-Auth). Specifying `uuid` for the foreign key in `payments` will result in a database type mismatch.
    *   *Correction*: Redefine to `userId: text("user_id").notNull().references(() => user.id)`.
*   **Dynamic Synchronization of Svelte 5 Global Context State**:
    In Module 5, your `UserSessionState` class is hydrated once at root. However, during runtime SPA navigations or client-side profile updates, your layout data may update without triggering a refetch or state synchronization in the singleton.
    *   *Correction*: Introduce Svelte 5's `$effect` in `+layout.svelte` to dynamically sync the server-loaded `data.user` with the global runes-based user session manager.
*   **Command Injection Vulnerability in E2B Compute Sandbox**:
    In Module 3, the code execution command escapes raw strings via `cmd: language === "js" ? node -e "${code.replace(/"/g, '\\"')}" : ...`. This is vulnerable to shell syntax crashes and command injection.
    *   *Correction*: Leverage E2B's secure virtual filesystem API to write the student code into a temporary file in the sandbox first (e.g. `index.js` or `main.py`) and then execute it via file-paths.
*   **Authentication & Authorization Gates Alignment**:
    In Module 4, your S3 presigned URL endpoint checks role permissions using raw string comparison: `locals.user.role !== "instructor"`.
    *   *Correction*: Utilize the robust role-based access control (AC) you built in Phase 0 by importing your `requireCan` helper from `$lib/server/authorize` to evaluate `requireCan(locals.user, "course", "create")`. This is cleaner and ensures instructors, editors, and admins can all lease storage.
*   **Environment Variable Import Alignment**:
    SvelteKit projects utilize dynamic private environment imports (`$env/dynamic/private`) or static ones for runtime flexibility and build safety. The plan references standard Node.js `process.env`.
    *   *Correction*: Standardize all secret retrievals via SvelteKit's private dynamic imports.

---

## Strengthened Module Implementation Blueprints

Here are the optimized, highly resilient blueprints for your core endpoints to complete Phase 1:

### 1. Corrected Payments Schema & Fulfillment Hook (`src/lib/server/db/schema.ts` & `src/routes/api/webhooks/payments/+server.ts`)

#### [MODIFY] `payments` schema:
```typescript
import { pgTable, uuid, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { user } from "./schema"; // references your existing user table

export const payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id").notNull(), // text reference for courses
    gateway: text("gateway").notNull(), // 'lenco' or 'dodo'
    gatewayReference: text("gateway_reference").notNull().unique(), // unique idempotency index
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull().default("pending"), // 'pending', 'successful', 'failed'
    createdAt: timestamp("created_at").defaultNow().notNull()
});
```

#### [NEW] Corrected Universal Webhook:
```typescript
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
    const provider = url.searchParams.get("provider");

    const secret = provider === "lenco" ? env.LENCO_WEBHOOK_SECRET : env.DODO_WEBHOOK_SECRET;
    const signature = request.headers.get(provider === "lenco" ? "x-lenco-signature" : "x-dodo-signature");

    if (!secret || !verifyHmac(rawBody, signature, secret)) {
        throw error(401, "Invalid cryptographic signature.");
    }

    const payload = JSON.parse(rawBody);
    const reference = provider === "lenco" ? payload.data.reference : payload.transaction.id;
    const amount = provider === "lenco" ? payload.data.amount : payload.transaction.amount;
    const currency = provider === "lenco" ? payload.data.currency : payload.transaction.currency;
    const customMetadata = provider === "lenco" ? payload.data.metadata : payload.transaction.metadata;

    try {
        // Idempotency: Insert transaction ledger intent
        await db.insert(payments).values({
            userId: customMetadata.userId,
            courseId: customMetadata.courseId,
            gateway: provider!,
            gatewayReference: reference,
            amount: amount.toString(),
            currency: currency,
            status: "pending"
        }).onConflictDoNothing();

        // Non-blocking background handoff via Inngest
        await sendInngestEvent("payment/process.fulfillment", {
            reference,
            gateway: provider,
            userId: customMetadata.userId,
            courseId: customMetadata.courseId
        });

        return json({ received: true }, { status: 200 });
    } catch (err) {
        throw error(500, "Transactional ingestion failed.");
    }
};
```

### 2. Robust Compute Sandbox Endpoint (`src/routes/api/compute/run/+server.ts`)

Eliminates bash injection vectors by executing virtual files.

```typescript
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Sandbox } from "@e2b/code-snippet";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.session) throw error(401, "Unauthorized execution request.");

    const { code, language } = await request.json();
    const filename = language === "js" ? "index.js" : "main.py";

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            const sendEvent = (event: string, data: any) => {
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            };

            try {
                sendEvent("status", { message: "Provisioning secure playground..." });
                const box = await Sandbox.create({ 
                    template: language || "python",
                    apiKey: env.E2B_API_KEY 
                });

                sendEvent("status", { message: "Writing code to workspace..." });
                await box.files.write(filename, code);

                sendEvent("status", { message: "Executing script run..." });
                const processExecution = await box.process.start({
                    cmd: language === "js" ? `node ${filename}` : `python3 ${filename}`,
                    onStdout: (chunk) => sendEvent("stdout", { output: chunk.line }),
                    onStderr: (chunk) => sendEvent("stderr", { output: chunk.line }),
                    timeout: 10000 // 10-second sandbox execution budget limit
                });

                await processExecution.finished;
                sendEvent("status", { message: "Completed execution cleanly." });
                await box.close();
                controller.close();
            } catch (err: any) {
                sendEvent("error", { message: err.message || "Runtime exception crashed." });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    });
};
```

### 3. Integrated Storage Pipeline with Custom AC (`src/routes/api/storage/presign/+server.ts`)

Utilizes Phase 0 Access Control statements to verify upload permissions.

```typescript
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "$env/dynamic/private";
import { requireCan } from "$lib/server/authorize";

const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!
    }
});

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.session || !locals.user) {
        throw error(401, "Authentication required.");
    }
    
    // Leverage existing Access Control (AC) roles. An instructor or higher can modify content.
    requireCan(locals.user, "course", "create");

    const { filename, contentType, size } = await request.json();
    
    // enforce file bounds (e.g., 200MB file limits)
    if (size > 200 * 1024 * 1024) {
        throw error(400, "File exceeds allowed upload size limits.");
    }

    const storageKey = `courses/assets/${crypto.randomUUID()}-${filename}`;

    const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: storageKey,
        ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    return json({
        uploadUrl,
        publicAssetUrl: `https://${env.AWS_CLOUDFRONT_DOMAIN}/${storageKey}`
    });
};
```

### 4. Reactive State Synchronization (`src/routes/+layout.svelte`)

Ensures the global client session store stays reactive when routing modifications occur.

```svelte
<script lang="ts">
    import "./layout.css";
    import { ModeWatcher } from "mode-watcher";
    import { initUserContext } from "$lib/client/state/user.svelte";
    
    let { data, children } = $props();

    // Initialize state container with Server Load layout data
    const sessionState = initUserContext(data.user);

    // Keep client context reactively bound to layout navigations
    $effect(() => {
        sessionState.updateProfile(data.user);
    });
</script>

<svelte:head>
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
    <link rel="shortcut icon" href="/favicon_io/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png" />
    <link rel="manifest" href="/favicon_io/site.webmanifest" />
</svelte:head>

<ModeWatcher />
{@render children()}
```

---

## Complete MVP Roadmap & Core Enhancements

To build out Roviolt Academy into a market-ready, gamified MVP, we must implement three critical engines: the **Interactive Gamification Engine**, the **Automatic Course Fulfillment Queue**, and the **Interactive Sandbox & AI Tutor Integration**. Here is the architecture blueprint to implement these systems.

### 1. The Interactive Gamification Engine

```
[Student Interactive Block] ──> [Success Criteria Met] ──> [POST /api/progress/complete]
                                                                        │
                                   ┌────────────────────────────────────┘
                                   ▼
                       [Drizzle: increment XP]
                       [Check & Update Streak]
                       [Unlock Badges via Inngest]
```

To drive user engagement, courses are split into modules, lessons, and interactive blocks. We track progress and reward XP/Badges dynamically.

#### Database schemas (`src/lib/server/db/schema.ts`):
```typescript
import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./schema";

// Courses catalog
export const courses = pgTable("courses", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    thumbnail: text("thumbnail"),
    isPublished: boolean("is_published").default(false).notNull(),
    price: integer("price").notNull(), // Stored in cents (e.g. 9900 = $99.00)
    createdAt: timestamp("created_at").defaultNow().notNull()
});

// Poly-morphic learning blocks within a lesson
export const learningBlocks = pgTable("learning_blocks", {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id").notNull(),
    type: text("type").notNull(), // 'video', 'reading', 'code', 'excel', 'graphic', 'dragdrop'
    config: jsonb("config").notNull(), // contains URLs, target output formulas, or sandboxing parameters
    order: integer("order").notNull(),
    points: integer("points").default(100).notNull()
});

// Streaks and progression values
export const userProgression = pgTable("user_progression", {
    userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
    xp: integer("xp").default(0).notNull(),
    level: integer("level").default(1).notNull(),
    currentStreak: integer("current_streak").default(0).notNull(),
    longestStreak: integer("longest_streak").default(0).notNull(),
    lastActiveAt: timestamp("last_active_at")
});

export const enrollments = pgTable("enrollments", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    status: text("status").default("active").notNull(), // 'active', 'completed'
    createdAt: timestamp("created_at").defaultNow().notNull()
});
```

#### Client-side Polymorphic Renderer (`src/lib/components/blocks/BlockDispatcher.svelte`):
```svelte
<script lang="ts">
    import VideoBlock from "./VideoBlock.svelte";
    import ReadingBlock from "./ReadingBlock.svelte";
    import CodeBlock from "./CodeBlock.svelte";
    import ExcelBlock from "./ExcelBlock.svelte";

    let { block, onComplete } = $props<{ 
        block: { id: string; type: string; config: any; points: number }; 
        onComplete: (xpEarned: number) => void;
    }>();
</script>

<div class="block-container p-4 border border-zinc-800 rounded-xl bg-zinc-950/80 backdrop-blur-md">
    {#if block.type === 'video'}
        <VideoBlock config={block.config} onComplete={() => onComplete(block.points)} />
    {:else if block.type === 'reading'}
        <ReadingBlock config={block.config} onComplete={() => onComplete(block.points)} />
    {:else if block.type === 'code'}
        <CodeBlock config={block.config} onComplete={() => onComplete(block.points)} />
    {:else if block.type === 'excel'}
        <ExcelBlock config={block.config} onComplete={() => onComplete(block.points)} />
    {/if}
</div>
```

---

### 2. Automatic Course Fulfillment & Enrollment Pipeline

This background worker triggers off the Inngest payment events (`payment/process.fulfillment`), updates your database, creates a user enrollment record, grants course access, and emails the student in a resilient, transactional process.

#### [NEW] Fulfillment Inngest Worker (`src/lib/inngest/functions.ts`):
```typescript
import { db } from "$lib/server/db";
import { payments, enrollments, userProgression } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { getInngest } from "./client";
import { Resend } from "resend";
import { env } from "$env/dynamic/private";

const resend = new Resend(env.RESEND_API_KEY);
const inngest = getInngest();

export const processPaymentFulfillment = inngest.createFunction(
    { 
        id: "payment-fulfillment",
        retry: 3
    },
    { event: "payment/process.fulfillment" },
    async ({ event, step }) => {
        const { reference, gateway, userId, courseId } = event.data;

        // Step 1: Guarantee Ledger Write transaction (marked successful)
        await step.run("mutate-ledger-status", async () => {
            return await db.update(payments)
                .set({ status: "successful" })
                .where(eq(payments.gatewayReference, reference));
        });

        // Step 2: Establish Course Access Enrollment
        await step.run("provision-enrollment", async () => {
            const enrollmentId = `enr-${crypto.randomUUID()}`;
            return await db.insert(enrollments).values({
                id: enrollmentId,
                userId,
                courseId,
                status: "active"
            });
        });

        // Step 3: Initialize student progression profile if not exists
        await step.run("ensure-progression-ledger", async () => {
            return await db.insert(userProgression).values({
                userId,
                xp: 100, // Grant bonus 100XP onboarding/purchase points!
                level: 1,
                currentStreak: 1
            }).onConflictDoNothing();
        });

        // Step 4: Dispatch email confirmation receipt
        await step.run("send-receipt-email", async () => {
            await resend.emails.send({
                from: "Roviolt Academy <learning@roviolt.com>",
                to: event.data.email || "recipient@domain.com",
                subject: "Your Course Enrollment is Confirmed!",
                html: `
                    <h2>Welcome to the Academy!</h2>
                    <p>Your payment with reference <strong>${reference}</strong> was processed via ${gateway}.</p>
                    <p>Course enrollment for ID: ${courseId} is now active. Log in to start learning!</p>
                `
            });
        });
    }
);
```

Add `processPaymentFulfillment` to your serverless adapter export in `src/routes/api/inngest/+server.ts` to expose the hook.

---

### 3. Integrated AI Code Mentor & Sandbox Optimization

This builds on top of Module 3 (E2B Sandboxing) to integrate NVIDIA NIM. When a student receives standard library compilation errors in the Code sandbox, their client code fires an evaluation hook to an AI Tutor endpoint that returns step-by-step assistance directly in the workspace.

#### [NEW] Sandbox AI Tutor Assistant (`src/routes/api/compute/tutor/+server.ts`):
```typescript
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.session) throw error(401, "Authentication required.");

    const { code, errorMessage, taskPrompt } = await request.json();

    try {
        // Calling NVIDIA NIM Llama 3 model for rapid, structured code diagnostics
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.NVIDIA_NIM_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta/llama3-70b-instruct",
                messages: [
                    {
                        role: "system",
                        content: "You are Roviolt AI, an elite gamified coding coach. Provide concise, friendly hints to help the student solve their compilation/logic error. DO NOT give them the direct copy-paste answer outright; guide them on how to fix it."
                    },
                    {
                        role: "user",
                        content: `Challenge Prompt: ${taskPrompt}\nStudent Code:\n\`\`\`\n${code}\n\`\`\`\nError Message:\n${errorMessage}`
                    }
                ],
                max_tokens: 250,
                temperature: 0.2
            })
        });

        const data = await response.json();
        return json({ hint: data.choices[0].message.content });
    } catch (err) {
        throw error(500, "Unable to reach NIM AI core.");
    }
};
```

---

## Phase 1 -> Full MVP Next Steps Checklist

- [ ] **Database Migration**: Deploy Neon migrations with newly appended schemas (`courses`, `learning_blocks`, `user_progression`, `enrollments`, `payments`).
- [ ] **Webhook Validation**: Integrate live cryptographic verification secret listeners for Lenco and Dodo on `/api/webhooks/payments`.
- [ ] **Background Processing**: Synchronize Inngest dashboard to bind the `payment-fulfillment` and `delayed-account-deletion` functions asynchronously.
- [ ] **Zero-Compute Storage**: Setup AWS S3/Cloudflare R2, generate bucket access keys, and configure `/api/storage/presign` with the `requireCan` access guards.
- [ ] **Interactive Sandboxes**: Configure the E2B SDK execution API with strict execution time constraints (10s limit) and secure code writing logic.
- [ ] **Gamification & AI Mentor**: Construct client-side polymorphic rendering dispatchers for course visual blocks and connect real-time NVIDIA NIM tutor callbacks.

