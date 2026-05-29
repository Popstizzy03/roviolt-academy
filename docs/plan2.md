#### 2a — Sentry Monitoring 
1. To start, how will sentry monitor the app in dev (localhost) and in production (vercel deployment), the main goal now is to add the necessary environment variables, so that I can be able to set up, monitoring with LOGS, METRICS, and TRACES. I hear sentry has SESSION REPLAYS and more monitoring methods I can use for the app both in local (if available) and in production. LOGS, METRICS and TRACES and more to have retention periods and also if there alerts then they are welcome, also this data needs to have not too much data and not too little data, just enough to query and solve issues and do more monitoring things in real time.
2. I also need a way to test sentry, out of he box. How does sentry even work? Give an analogy to explain how sentry monitors my app under the hood.
3. I'm quite worried with setting source maps to true, recently Apple leaked their apple app store site by essentially keeping source maps to true, I don't know how secure this is, is there a secure way to deploy the app while allowing SvelteKIT to run safely in sentry?

#### 2b  — Storage Adapter (R2 + Supabase via AWS SDK)
1. How exactly does the app differentiate R2 from SUPSBASE and vice versa?
2. I hear that when files have to be uploaded, the client tells the server to request a signed temporary url from the storage endpoint and files get uploaded without the server ever touching the files, this is supposed to be cost efficient and neat.
3. How does this endpoint  get secured? Say I navigate to,  for example /api/supabase/some_valid_endpoint will the user see data? How much data do they see?, should they be seeing this data? Is `source maps: true`, revealing this data? ... I'm probably over thinking this, I bet there is a standard secure way to implement this securely. 
4. When an instructor has their script (component blocks content) they will clearly upload in a way that has order, and that order gets shipped. But it has to be checked before initial upload and updates to the course. This uploaded content, where does it sit while pending approval? How does it get merged in the current structure when an update has been made? Maybe if the script ready method is too exhausting for the instructor/admin, they could maybe have some kind of playground to draft course creation? But still, content still has to be moved from their local device, to the S3 bucket even as they draft, or there is an efficient way to solve this? Having a script allows preparedness. When a course is rejected, maybe there could be a reason for the instructor on improvements they can make. The video content will have to be transformed to `.ts`  video files to be streamed via hls.js for security right, there will be 480, 720 and 1080 to be toggledwhen accessed, also there will be a protocol to setup paths for these videos without being overwhelmed, for example a video has been uploaded and it takes the path `graphic-design/color_theory/intro-video.mp4`  --> transformation to .ts with ffmpeg, branding and watermarks added --> requested in a lesson session when accessed. What questions am I not asking and are important?
#### 3a — All New Database Schemas (Single Migration)
1. This will be the point to integrate `better-auth sentinel()`  to safe guard from freemium abuse. And more security, this is due to the fact that while I setup device fingerprinting and ip address in the database, they are empty and not setup correctly, so this should resolve that. Maybe when logged in there could be a country detection system, maybe it could help with dodo/lenco payment method. How will dodo translate currencies all over the world to kwacha? Is there fraud detection, o bet better-auth and sentinel will take care of this, or there is a strategic long term scalable solution. 
2. When lessons get updated, they update the overall course right? Does the setup allow course progress, module progress, lesson progress and if possible lesson block progress? How will heartbeats be Implemented in three learning session, how does any of this work? Which is better, freemium courses available to all (including unregistered users && not logged in) Or on registered user and logged in, again there is room for better-auth sentinel to protect from abuse. 
3. Course prices are setup/will be set up in cents. How will we implement currency translation? Foe example dollar to Kwacha, or dollar to yens for both dodo and lenco payment pipelines? (If dodo can work with mobile money in Zambia and other countries where cards are not used oftenly, I'd definitely see no use for lenco). So for now, thos hybrid payment system better be robust. How do we deal with payment edge cases? What functions will inngest Handle, maybe retrys, reconciliation ofnsaid payments and more standard payments edge cases, theybalso have to be monitored. So, it better to implement purchase one course each or a cart system to buy multiple courses at once, or both? All this needs schema validation and so on, earning certificates, printing them and storing them and all while assigning code links for public display. 
4. dnd-svelte will be used for drag and drop lesson blocks 🎉. All these don't have to be set up at once, but they have to be kept in mind so that the app does not diverge into chaos.

---

## Responses to Above Questions

### 2a — Sentry Monitoring

#### How Sentry works locally vs. production

**Analogy:** Sentry is a black box flight recorder on an airplane. Your app is the plane. When something breaks (error, crash), the black box automatically records the altitude (timing), the controls (code path), and the pilot's voice (logs). It packages that recording and beams it to headquarters (sentry.io) for analysis. On **localhost**, the same black box is active — but you don't need real-time alerts because you're the pilot. In **production**, you can set up alarms (alerts) that page you when key events happen.

**What you get out of the box with `@sentry/sveltekit`:**

| Feature | Local dev | Production | Config needed |
|---------|-----------|------------|---------------|
| Errors (Issues) | ✅ Captured | ✅ Captured | Just `PUBLIC_SENTRY_DSN` |
| Exception stack traces | ✅ With source code | ✅ With source maps | `sourcemap: true` (done) |
| Performance traces | ✅ | ✅ | `tracesSampleRate` tunable |
| Releases | ❌ | ✅ (Vercel) | Sentry Vercel integration |
| Session Replays | ⚠️ Extra setup | ⚠️ Extra setup | Add `replayIntegration()` |
| Logs | ❌ Not needed locally | ✅ Add `sentryLogger()` | Extra setup |

**Recommended data volume to start:**
- `tracesSampleRate: 0.1` — 10% of requests traced, enough to find patterns without burning quota
- `replaysSessionSampleRate: 0.1` — if replays are added later
- Errors always captured at 100%

#### How Sentry works under the hood (extended analogy)

Imagine your app is a busy restaurant kitchen. The chefs (your code) are cooking. Sentry stations a silent food critic at every station:

- **Error capture (Issues):** When a chef drops a plate (`throw new Error`), the critic instantly snaps a photo of the kitchen at that exact moment (stack trace, local variables, URL, browser). They file a report that groups similar incidents. If the same dish is dropped 100 times, Sentry says "This recipe has a problem that caused 100 incidents" — not 100 separate reports. This is error **grouping**.

- **Tracing:** The critic follows one order (a user request) from the window (HTTP request) through each station (SvelteKit load functions, database queries, external API calls). They time each step and draw a waterfall chart. When an order is slow, you see exactly which station was the bottleneck.

- **Source maps:** The critic writes reports using chef nicknames ("Joe dropped the pan"). Without source maps, the kitchen manager gets "Employee #9482 dropped pan #7" — useless. Source maps translate "Employee #9482" back to "Joe" and "pan #7" back to "the sauté pan at station 3". It's a lookup table from minified code to readable code, used only *after* an error when viewing it in Sentry.

#### Source maps security

The Apple leak happened because their `.map` files were **publicly accessible on their CDN**. With the Sentry flow:
1. `sourcemap: true` generates `.map` files during `vite build`
2. The Sentry Vercel integration (or `sentry-cli`) uploads them **directly to Sentry's servers**
3. The `.map` files are **deleted from the build output before deployment** to Vercel
4. Browsers never see the `.map` files — only the minified bundle

**Setup required for production:**
- Install [Sentry Vercel Integration](https://docs.sentry.io/product/integrations/vercel/) in your Vercel dashboard
- Or add a build step: `sentry-cli sourcemaps upload` then delete `.map` files
- We will set this up before the first production deployment

#### How to test Sentry

1. Temporarily add to any route:
   ```svelte
   <script lang="ts">
   throw new Error("Sentry test - remove me");
   </script>
   ```
2. Visit that page → error appears in sentry.io → Issues within 30 seconds
3. Remove the test error afterwards

---

### 2b — Storage Adapter

#### How R2 vs Supabase is differentiated

The adapter checks the `STORAGE_PROVIDER` env var:
```
STORAGE_PROVIDER=r2       # or "supabase"
```

Both use the S3-compatible API (`@aws-sdk/client-s3`), but differ in:

| Aspect | Cloudflare R2 | Supabase S3-mode |
|--------|---------------|-------------------|
| Endpoint | `https://<account>.r2.cloudflarestorage.com` | `https://<project>.supabase.co/storage/v1/s3` |
| URL style | `forcePathStyle: true` | Virtual-hosted style |
| Public URL pattern | `https://<r2-dev-domain>/<key>` | `https://<project>.supabase.co/storage/v1/object/public/<bucket>/<key>` |
| Free tier | 10 GB storage, 1M operations/month | 1 GB storage, 2 GB bandwidth |

The `S3CompatibleAdapter` class handles both via config — it's a single env var switch.

#### Presigned URL upload flow (confirmation)

Your understanding is correct — this is the standard pattern used by GitHub, Slack, Vercel, etc.:

```
Client                    Server                    S3/Bucket
  │                         │                         │
  │── POST /api/storage/presign ──►                    │
  │   { filename, contentType, size }                  │
  │                         │                         │
  │                         ├── Auth check            │
  │                         ├── Permission check      │
  │                         └── GetSignedUrl ────────► │
  │◄── { uploadUrl,         │◄──── signed_url ──────── │
  │      publicUrl }        │                         │
  │                         │                         │
  │── PUT uploadUrl ─────────────────────────────────► │
  │   (file body)                                      │
  │◄── 200 OK ─────────────────────────────────────── │
```

**Benefits:** Server never touches file bytes → no memory pressure → no Lambda timeouts → direct upload at client bandwidth → cost efficient.

#### How `/api/storage/presign` is secured

1. **Authentication:** Checks `locals.session` → unauthenticated requests get 401
2. **Authorization:** `requireCan(locals.user, "course", "create")` → only instructors/admins/editors can upload → students get 403
3. **Response scope:** Only returns `{ uploadUrl, publicUrl }`. No bucket listing, no file enumeration, no access to other users' data.
4. **Expiring URLs:** Signed URL expires in 15 minutes → even if intercepted, can only upload one file to one specific path
5. **Source maps do not expose this:** The endpoint path is visible in every browser's network tab anyway. Security comes from auth + auth + expiry, not obscurity.

---

### Content Pipeline (Video Upload → Transcode → Stream)

#### Recommended: Cloudflare Stream instead of self-hosted FFmpeg

**Why:**
- Self-hosted FFmpeg on serverless functions hits Lambda's 15-minute timeout for long videos
- Cloudflare Stream handles scaling, CDN delivery, ABR (adaptive bitrate), thumbnails, and branding
- **Free tier:** Up to 100 minutes of video storage — enough for development and early launch
- Paid: $5/month for 1,000 minutes stored + $1/1,000 minutes delivered

**How the pipeline works with Cloudflare Stream:**

```
Instructor uploads .mp4
         │
         ▼
POST /api/storage/presign (gets signed URL from R2)
         │
         ▼
Client uploads to R2 via presigned URL
         │
         ▼
Inngest function: "media/process.video"
  │
  ├── Step 1: Download from R2 temp URL
  ├── Step 2: Upload to Cloudflare Stream via their API
  │   POST https://api.cloudflare.com/client/v4/accounts/{id}/stream
  │   Body: { url: "signed-r2-url" }
  │   Cloudflare handles: transcoding to HLS, 480/720/1080p, thumbnails
  ├── Step 3: Store Cloudflare Stream UID in learning_block.config
  │   config = { provider: "cloudflare-stream", uid: "abc123" }
  └── Step 4: Cleanup temp file from R2
         │
         ▼
Lesson player renders via hls.js with Cloudflare Stream embed URL
  <video src="https://customer-{code}.cloudflarestream.com/{uid}/manifest/video.m3u8" />
```

**Alternative: Mux**
- Similar to Cloudflare Stream, with a different API
- Free tier: 15 minutes of video encoded
- Might be preferred if the broader infrastructure is on AWS

**Decision needed at Wave 3:** Cloudflare Stream vs Mux vs self-hosted FFmpeg.

#### Content lifecycle: Draft → Approval → Published

```
Instructor uploads video
         │
         ▼
Stored at: drafts/{courseId}/{lessonId}/raw.mp4
         │
         ▼
Instructor builds lesson in "preview mode" — reads from drafts/
         │
         ▼
Instructor submits course for approval
         │
         ▼
Admin reviews → Reject (with reason stored in DB) → Instructor revises
         │
         ▼ (Approved)
Inngest function: "content/publish.lesson"
  ├── Step 1: Trigger Cloudflare Stream transcode
  ├── Step 2: Update learning_block.config with stream UID
  ├── Step 3: Move/delete draft content
  └── Step 4: Set lesson to published
         │
         ▼
Students access published lesson — reads from Cloudflare Stream
```

**For course updates (new version of an existing lesson):**
- Option A: Upload to a new draft, Cloudflare Stream generates new UID, update config when approved
- Option B: Version prefix — `courses/{courseId}/{lessonId}/v1/`, `v2/`, etc.
- Recommended: Start with Option A (simpler), add versioning later if needed

#### Questions you should be asking but haven't yet:

> **"Should we use a dedicated video transcoding service (Cloudflare Stream, Mux) or self-host FFmpeg?"**

Addressed above — recommend Cloudflare Stream for the free tier and managed infra.

> **"How do we handle course rejection feedback to the instructor?"**

Store rejection reason in a `review_notes` column on the course/lesson table. Display in instructor dashboard.

> **"Do we watermark videos, and if so, when?"**

Cloudflare Stream supports watermark templates via API. Configure once, and it's applied during transcoding.

> **"What's the storage path convention to avoid chaos?"**

```
drafts/{courseId}/{lessonId}/raw.{ext}         ← pending approval
courses/{courseId}/{lessonId}/v{1}/            ← published (versioned)
learners/{userId}/uploads/{assetId}.{ext}       ← student-submitted work (code sandbox exports, assignments)
```

> **"How does search work across video content?"**

Cloudflare Stream can generate captions (auto-speech-recognition) and store them as WebVTT. Those captions can be indexed with a full-text search engine (like Meilisearch or pg_bigm on Postgres). Alternatively, keep transcripts in the DB alongside learning_blocks.

---

### How Inngest Interacts With These Tools

Inngest is the **orchestrator** — it ties all these services together with retries, idempotency, and observability.

```
                    ┌─────────────────────────────────────────────┐
                    │              Inngest Platform               │
                    │  (event-driven, retries, idempotency, logs) │
                    └─────────────────────────────────────────────┘
                                │           │           │
            ┌───────────────────┘           │           └───────────────────┐
            ▼                               ▼                               ▼
    ┌───────────────┐             ┌───────────────────┐         ┌───────────────────┐
    │  Cloudflare   │             │  Storage (R2)     │         │  Resend (Email)   │
    │  Stream       │             │  via S3 SDK        │         │                   │
    │               │             │                   │         │                   │
    │ Transcode     │             │ Presigned URLs    │         │ Send receipts     │
    │ Watermark     │             │ Draft storage     │         │ Notifications     │
    │ Thumbnails    │             │ Public content    │         │ Account updates   │
    └───────────────┘             └───────────────────┘         └───────────────────┘
```

**Key Inngest functions planned across all waves:**

| Function | Trigger | What it does | Services used |
|----------|---------|-------------|---------------|
| `payment/process.fulfillment` | Payment webhook | Update payment status, create enrollment, init progression, send receipt | DB, Resend |
| `payment/reconcile` | Cron (daily) | Match pending payments against gateway, auto-cancel stale ones | DB, Lenco/Dodo API |
| `user/deletion.requested` | Account deletion | Schedule permanent deletion after 30 days, send confirmation | DB, Resend |
| `user/deletion.cancelled` | Login during grace period | Cancel pending deletion, restore account | DB, Resend |
| `user/deletion.execute` | Cron (daily) | Permanently delete accounts past the 30-day grace period | DB, R2 (delete user files) |
| `media/process.video` | Upload complete | Transcode via Cloudflare Stream, update lesson config | R2, Cloudflare Stream |
| `content/publish.lesson` | Admin approves | Move drafts to published, trigger transcoding, notify instructor | DB, R2, Cloudflare Stream |

---

### 3a — Database Schemas (Early Concerns)

#### `better-auth sentinel()` + fraud detection

Sentinel handles:
- Device fingerprinting (canvas, WebGL, audio context)
- IP-based rate limiting
- Suspicious login detection

**Sentinel + freemium abuse prevention:**
- Sentinel fingerprints each login and attaches it to the session
- When a freemium user hits their limit, we can check if the same device fingerprint has created multiple accounts → flag for review or block
- Sentinel runs on the server via `better-auth` config, no extra DB work needed

**Country detection:**
- Can be derived from `request.headers.get("cf-ipcountry")` if using Cloudflare, or from IP geolocation via a package like `geoip-lite` or `maxmind`
- Useful for showing prices in local currency and routing to the correct payment gateway

**Currency conversion for payments:**
- **Lenco:** Accepts USD (and other currencies). Lenco's checkout widget handles the conversion display. You set the price in USD, Lenco shows the shopper their local equivalent.
- **Dodo (mobile money):** Charges in local currency (ZMK). At checkout, convert USD cents → ZMK using a real-time exchange rate (e.g., from a free API like exchangerate.host or the Bank of Zambia). The conversion happens server-side, and you charge Dodo in ZMK.
- **Strategy:** Store prices in USD cents. Convert on checkout. Cache exchange rates for 1 hour to avoid API rate limits.

#### Lesson progress tracking (heartbeats)

The current schema tracks **binary completion per block** via `block_completions`. The hierarchy:

```
Course ── Module ── Lesson ── LearningBlock
  │         │         │           └── completion (userId, blockId, timestamp)
  │         │         └── progress = blocks completed / total blocks
  │         └── progress = lessons completed / total lessons
  └── progress = modules completed / total modules
```

**Future: `lesson_sessions` table for real-time heartbeats:**

```ts
export const lessonSessions = pgTable("lesson_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  lessonId: text("lesson_id").notNull().references(() => lessons.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastHeartbeatAt: timestamp("last_heartbeat_at"),
  totalWatchSeconds: integer("total_watch_seconds").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
});
```

- Client sends heartbeat every 30 seconds while watching a video or interacting with a block
- On tab close or lesson end, `totalWatchSeconds` is finalised
- Enables: "where you left off" resume, analytics on engagement, heat maps of popular content

#### Freemium strategy recommendation

**Registered + logged-in only.** Reasons:
- Sentinel abuse detection works per-user, not per-IP (IPs change — mobile users, VPNs)
- Freemium limit counting needs a persistent user identity
- Onboarding sets expectations for the platform
- Signup friction is minimal (email + password or Google/GitHub OAuth)

#### Payment edge cases and Inngest reconciliation

| Edge case | How handled |
|-----------|-------------|
| Payment confirmed but enrollment fails | Inngest retries (3 attempts with exponential backoff) |
| Duplicate webhook from gateway | `onConflictDoNothing` by `gatewayReference` (unique constraint) |
| User closes browser before redirect | Webhook still fires — enrollment happens async regardless |
| Payment stuck in "pending" for hours | Daily cron (`payment/reconcile`) checks gateway API for stale payments |
| Payment successful but Inngest exhausted retries | Payment marked as `successful` but enrollment is `pending` — manual admin override or a separate retry queue |
| Refund / chargeback | Webhook from gateway → `status: "refunded"` → enrollment set to `archived` → user loses access |
| Gateway down at checkout | Checkout page shows error, user retries. No partial state created. |
| Currency fluctuation between checkout and confirmation | Tolerance check: if rate changed >5%, reject and ask user to re-confirm |

**Single course vs cart:** Start with single course purchase. Carts add complexity (partial payments, expiry, inventory holds) with little benefit at MVP scale.

**Certificates:**
- Template stored in DB or as HTML with placeholders (`{name}`, `{course}`, `{date}`, `{completionCode}`)
- Generate as PDF on the server when a course is completed (Inngest function: `learner/course.completed`)
- Store in R2 at `certificates/{userId}/{courseId}.pdf` with a presigned URL for download
- Public verification link: `https://roviolt.com/verify/{completionCode}` — shows name, course, date of completion (no need to be logged in)

---

### Source Map Security Setup (Production)

To ensure `.map` files are never sent to the browser in production:

**Method 1: Sentry Vercel Integration (recommended)**
1. Go to your Vercel dashboard → Integrations → Browse → Search "Sentry"
2. Install the Sentry integration → link your Sentry account
3. During `vercel build`, Sentry automatically:
   - Detects `.map` files in the output
   - Uploads them to Sentry
   - Deletes them from the build output before deploying to the CDN
4. No `.map` files ever reach Vercel's static assets — browsers can never download them

**Method 2: Manual script in package.json (fallback)**
```json
{
  "scripts": {
    "build": "vite build && sentry-cli sourcemaps upload .svelte-kit/output && rm -rf .svelte-kit/output/**/*.map"
  }
}
```

**We will use Method 1 (Vercel Integration) when deploying.**

---

### Tooling Summary

| Tool | Purpose | Free tier | Paid tier starts |
|------|---------|-----------|-----------------|
| Sentry | Error monitoring, performance, traces | 5k events/month | $29/month |
| Cloudflare Stream | Video transcoding, HLS, CDN | 100 minutes storage | $5/month |
| Cloudflare R2 | S3-compatible object storage | 10 GB, 1M ops/month | $0.015/GB |
| Supabase Storage | Alternative to R2 (S3-mode) | 1 GB, 2 GB bandwidth | $25/month |
| Resend | Transactional emails | 100/day | Free for 3k/month |
| Inngest | Orchestration, retries, cron | 50k events/month | $20/month |
| Better-Auth | Auth, Sentinel fraud detection | Free | Free |
| Dodo Payments | Mobile money (Zambia, Africa) | Per-transaction fee | N/A |
| Lenco Payments | Cards, multi-currency | Per-transaction fee | N/A |

**How they chain together (example: video upload → publish):**

```
Upload complete
    │
    ▼
Inngest receives "media/process.video" event
    │
    ├── Step 1: Copy file from R2 draft to Cloudflare Stream
    │     POST https://api.cloudflare.com/client/v4/stream
    │     { url: "https://r2.dev/drafts/video.mp4" }
    │
    ├── Step 2: Cloudflare Stream processes (async)
    │     Webhook → Inngest receives "cloudflare/stream.ready" event
    │
    ├── Step 3: Inngest updates learning_block.config
    │     UPDATE learning_blocks SET config = { provider: "cloudflare-stream", uid: "abc" }
    │
    └── Step 4: If content was published (not draft):
          Inngest sends email via Resend: "Your lesson is live!"
```

This chain is fully observable in the Inngest dashboard — each step shows timing, retries, and logs. 

---

### Lenco Payment Implementation Fixes

Based on the Lenco documentation and the current codebase state, there is a divergence between the documented plan (`PAYMENT_IMPLEMENTATION.md`) and the actual implementation in `src/routes/(public)/courses/[slug]/checkout/+page.svelte`.

**The Root Cause:**
1. **Mismatch in Flow:** `PAYMENT_IMPLEMENTATION.md` specifies using the **Client-Side Widget** (`inline.js` -> `LencoPay.getPaid`). However, the codebase uses a **Server-Side API** approach calling `/collections/mobile-money` via a SvelteKit form action.
2. **Environment Variables Bug:** In `src/lib/server/payments/lenco-client.ts`, the code uses `process.env.LENCO_API_TOKEN` instead of SvelteKit's `$env/dynamic/private`. This causes the token to be undefined in many SvelteKit contexts, failing the API call silently or throwing an unhandled exception (which Sentry previously missed).

**The Solution:**
To align with best practices and the original design doc, we should revert to the **Client-Side Widget Flow**.

1. **Frontend Update (`checkout/+page.svelte`):**
   - Remove the `method="POST"` form action that calls the backend directly for Lenco.
   - Add a `<svelte:head>` or dynamic script loader for `https://pay.lenco.co/js/v1/inline.js` (and the sandbox equivalent).
   - On checkout click, invoke `LencoPay.getPaid({ key, reference, amount, customer, onSuccess, ... })`.
2. **Backend Verification (`/api/payments/verify`):**
   - When the widget triggers `onSuccess`, it returns a reference.
   - The frontend makes a `GET` request to our server (`/api/payments/verify/{reference}`).
   - The server calls `GET https://api.lenco.co/access/v2/collections/status/{reference}` to securely confirm the payment.
   - If successful, the server creates the enrollment (`fulfillEnrollment`) and responds with success.
3. **Environment Variables:**
   - Migrate `process.env.*` in `lenco-client.ts` to use `$env/dynamic/private` to ensure the API tokens are securely and reliably accessed in SvelteKit.
4. **Webhooks:**
   - Ensure the `/api/payments/webhook` endpoint is listening for `collection.successful` to catch mobile-money payments that complete asynchronously after the user closes the widget.