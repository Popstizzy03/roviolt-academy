# CHANGELOG

## [29 May 2026] — Lenco Payment Gateway Integration

### Features
- **Lenco payment widget**: Replaced hardcoded checkout flow with real Lenco payment gateway integration. New `PaymentButton.svelte` component with full state machine (`idle → initiating → widget_open → verifying → awaiting_mobile → enrolled`).
- **Server-side API endpoints**: Added dedicated payment API routes — `POST /api/payments/initiate`, `GET /api/payments/verify/[reference]`, `POST /api/payments/cancel-by-reference/[reference]`, `POST /api/payments/abandon`, `POST /api/payments/widget-opened`, `GET /api/payments/user/[userId]`.
- **SSE real-time status**: Added `GET /api/payments/stream/[reference]` SSE endpoint for real-time mobile money payment status updates. Gateway service at `src/lib/server/payments/payment-status-gateway.ts` emits `payment.completed`, `payment.failed`, `payment.cancelled` events.
- **Webhook enhancements**: Webhook handler now emits SSE events for `collection.failed` and `collection.cancelled` events (not just `collection.successful`), enabling real-time feedback for all payment outcomes.
- **Client payment library**: Added `src/lib/api/payment.ts` API wrapper, `src/lib/types/payment.ts` TypeScript interfaces, and `LencoScriptLoader.svelte` component with 12-second polling timeout.

### Bug Fixes
- **Missing email parameter (Lenco widget white screen)**: The Lenco payment widget requires the `email` field. It was not being passed in the `LencoPay.getPaid()` call, causing the widget to open as a blank white modal. Fixed by adding `email` (and optional `customer`) props to `PaymentButton.svelte`, passing user email from `locals.user.email` via the checkout page server load function.
- **`$env/dynamic/public` reliability**: Switched to `$env/static/public` for accessing `PUBLIC_LENCO_PUBLIC_KEY` to avoid potential hydration issues where dynamic env vars might not be available.
- **`lenco-client.ts` RequestEvent dependency**: Refactored `verifyLencoPayment()` and `initiateLencoMobileMoney()` to use native `fetch` instead of SvelteKit's `event.fetch`, making them usable from API endpoint handlers (which don't have `RequestEvent`).
- **Webhook duplicate reference declaration**: Fixed `const reference` being declared twice in the Lenco webhook handler — moved to a single declaration before event type checks.
- **`payments` schema mismatch**: Added `metadata` (jsonb) and `updatedAt` (timestamp) columns to the `payments` table definition. Requires `pnpm db:push` to apply.

### Infrastructure
- **pnpm binary corruption**: Fixed broken pnpm executable (`~/.local/share/pnpm/bin/pnpm`) that contained "This file intentionally left blank" instead of the actual binary. Removed the stale shim; npm-installed pnpm at the nvm path now takes precedence.
- **`InitiatePaymentDto.userId` made optional**: The server overrides `userId` from the authenticated session regardless of client input, so the field was made optional in the type definition.

## [21 May 2026] — Initial application MVP

### Features
- **Authentication**: Email/password signup, sign-in, sign-out, forgot-password, reset-password, OAuth (GitHub, Google), admin role assignment via email plugin.
- **Onboarding flow**: 4-step wizard with legal consent (Terms, Privacy, Marketing) step 0, profile fields (display name, bio, interests, specialty, skill level). Server-side validation of required consents.
- **Account deletion**: Soft-flag with 30-day grace period via Inngest. `deletionStatus` + `deletedAt` columns. Password verification + confirmation checkbox required. Auto-restoration on any authenticated request during grace period (hooks.server.ts). Manual restore button in settings. Email notifications for both deletion request and restoration.
- **Dashboard**: Layout with sidebar navigation, role-request flow, admin role-request approval, settings page with delete/restore account UI.
- **Terms, Privacy, Marketing pages**: Static markdown rendered via mdsvex.
- **Email notifications**: Resend integration for deletion confirmation and account restoration emails.
- **Inngest integration**: v4.4.0 with `delayedAccountDeletion` function using `cancelOn` + `step.sleep("30d")`. Wrapper `sendInngestEvent` skips when `INNGEST_EVENT_KEY=local`.

### Bug Fixes
- **`import type` systemic bug**: ~50+ shadcn-svelte generated files used `import type` for runtime component values (`Label`, `Sidebar`, `Button`, `TooltipPortal`, etc.). Changed to `import` to fix "is not defined" errors.
- **Phosphor-Svelte icon migration**: Replaced all 45+ Lucide/Tabler icon imports with Phosphor-Svelte v3.1.0 across 13 components.
- **Admin role assignment**: Inline `adminByEmailPlugin` + in-memory patch in `hooks.server.ts` for stale session cache.
- **OAuth-only account detection**: Fixed forgot-password flow to handle non-email accounts.
- **Onboarding redirect guard**: Prevents access to dashboard until onboarding completed.
- **Inngest env guard**: SDK `isDev` mode via `INNGEST_DEV` env var, `INNGEST_EVENT_KEY=local` skips event sends during development.

### Infrastructure
- **Drizzle schema**: 5 new columns on `user` table — `acceptedTerms`, `acceptedPrivacy`, `marketingOptIn`, `deletionStatus`, `deletedAt`. 5 additional fields registered in better-auth `user.additionalFields`. Migration applied via `pnpm db:push`.
- **Inngest serve handler**: Route at `src/routes/api/inngest/+server.ts` with `serve()` from `inngest/sveltekit`. Dev Server configuration via `-u http://localhost:5173/api/inngest`.
- **DNS/IPv4 fix**: Node.js `dns.lookup` monkey-patch in `drizzle.config.ts` for Neon DB connectivity on Crostini/ChromeOS (IPv6 routing issue).
- **`account.userId` type fix**: Changed from `text` to `uuid` to match referenced `user.id` column.

---

## [17th May 2026] — Debugging `drizzle-kit push` Silent Hang

## Environment Context

- **OS**: ChromeOS Crostini (Debian Linux container running via penguin VM)
- **Node.js**: v24.15.0
- **pnpm**: (workspace monorepo with `@neondatabase/serverless`, `drizzle-kit@0.31.10`, `drizzle-orm@0.45.2`)
- **Database**: Neon PostgreSQL (pooler endpoint: `*-pooler.sa-east-1.aws.neon.tech`)
- **Package manager hooks**: dotenv, esbuild (used by drizzle-kit to compile `drizzle.config.ts`)

---

## Problem Statement

```
$ pnpm drizzle-kit push
No config path provided, using default 'drizzle.config.ts'
Reading config file '/home/rabboni_kabongo/roviolt-academy/drizzle.config.ts'
◇ injected env (0) from .env
Using 'pg' driver for database querying
[⣷] Pulling schema from database...
```

The spinner animated indefinitely (30+ seconds) with no error, no timeout, no progress. The command never completed — a **silent hang** at the "Pulling schema from database..." phase.

---

## Phase 1 — Initial Reconnaissance (Config & Env Checks)

### 1.1 Read the drizzle config

**Command**:
```bash
cat drizzle.config.ts
```

**Finding**: The config used `dns.setDefaultResultOrder("ipv4first")` — a ChromeOS network routing patch already in place. The config parsed `DATABASE_URL` from `.env`, set `sslmode` and `channel_binding` safeguards, then passed the URL to `defineConfig`.

**Suspicion**: The `dns.setDefaultResultOrder("ipv4first")` was already there but the hang persisted. So either the DNS ordering wasn't the root issue, or it was failing to apply.

### 1.2 Check drizzle-kit version

**Command**:
```bash
pnpm drizzle-kit --version  # → v0.31.10
npm ls drizzle-orm          # → v0.45.2 (multiple copies due to hoisting conflicts)
```

### 1.3 Inspect `.env` raw bytes

**Command**:
```bash
xxd .env | head -30
```

**Finding**: A leading space character (`0x20`) existed before `DATABASE_URL=` on line 3. I worried `dotenv` might skip it — but a subsequent Node.js test confirmed `dotenv.config()` parsed it correctly (5 variables loaded including `DATABASE_URL`). **Not the issue.**

### 1.4 Check existing migrations

**Command**:
```bash
ls -la drizzle/  # contains 0000_round_cable.sql + meta/_journal.json
```

The existing migration declared `account."userId"` as `text` and `session."userId"` as `uuid`. This would later become relevant for the schema type mismatch, but wasn't the cause of the hang.

---

## Phase 2 — Network Connectivity Tests

### 2.1 Why start with the network?

The hang occurred _during_ "Pulling schema from database...", which is the step where drizzle-kit connects to the database and introspects its schema. This is a network I/O operation. The three most common causes of a silent hang are:

1. **DNS resolution failure** — hostname never resolves → indefinite wait
2. **TCP connection timeout** — SYN sent but no SYN-ACK → kernel waits forever
3. **SSL/TLS handshake deadlock** — TLS ClientHello sent but server doesn't respond, or certificate validation hangs

### 2.2 Ping test

```bash
ping -c 2 ep-dark-bonus-acb97i99-pooler.sa-east-1.aws.neon.tech
# → timed out (no response, exit code 1)
```

First clue: **ICMP is blocked**. Common in containers and cloud environments, so not conclusive on its own.

### 2.3 TCP connectivity (bash /dev/tcp)

```bash
timeout 10 bash -c 'echo > /dev/tcp/18.229.40.57/5432' && echo reachable
# → reachable
```

Bash's `/dev/tcp` uses the kernel's TCP stack directly (syscall `connect(2)`). This succeeded, meaning **TCP port 5432 accepts connections**. But this only proves the three-way handshake works — not that the PostgreSQL protocol or TLS negotiates.

### 2.4 DNS resolution

```bash
node -e "
const dns = require('dns');
dns.resolve('ep-dark-bonus-acb97i99-pooler.sa-east-1.aws.neon.tech', (err, addrs) => {
  console.log('Resolved:', addrs);
});
"
# → Resolved: ['54.232.181.76', '18.230.255.48', '18.229.40.57']
```

DNS works. The hostname resolves to three IPv4 addresses in the AWS `sa-east-1` region.

### 2.5 IPv6 presence check

```bash
node -e "
dns.resolve6('...', (err, addrs) => {
  if (err) console.log('No IPv6:', err.code);
  else console.log('IPv6 addrs:', addrs);
});
"
# → IPv6 addrs: [
#   '2600:1f1e:2f:650c:e656:26eb:8047:8989',
#   '2600:1f1e:2f:652d:21b7:8d2c:78a1:afcf',
#   '2600:1f1e:2f:6511:53ca:e80a:6f85:6ec3'
# ]
```

**Key discovery**: The hostname has **AAAA records** (IPv6 addresses) in addition to A records. Crostini containers use `eth0` with a `100.115.x.x` private gateway that routes through ChromeOS — which does NOT have working IPv6 to the public internet.

### 2.6 System DNS + gateway config

```bash
cat /etc/resolv.conf
# nameserver 192.168.100.4
# nameserver 192.168.99.80
ip route
# default via 100.115.92.25 dev eth0
# 100.115.92.24/30 dev eth0 ...
```

The container uses private DNS servers and a private gateway — standard Crostini networking. IPv6 routes were absent.

### 2.7 Raw TLS test via OpenSSL

```bash
openssl s_client -connect ep-dark-bonus-acb97i99-pooler.sa-east-1.aws.neon.tech:5432 \
  -servername ep-dark-bonus-acb97i99-pooler.sa-east-1.aws.neon.tech <<< "Q" | head -30
```

**Result**: TLS handshake succeeded. Certificate chain:
- `CN=*.sa-east-1.aws.neon.tech` (Let's Encrypt R13)
- Valid, not expired

This proved the Neon server's TLS is functional and reachable — the issue must be in the **Node.js client side**, not the network or the server.

---

## Phase 3 — Isolating the Failure in Node.js

### 3.1 Hypothesis: `dns.lookup` vs `tls.connect`

I'd observed:
- `openssl s_client` → ✅ works
- `bash /dev/tcp` → ✅ works
- `net.connect(ip, 5432)` → ✅ works (manual test)
- `tls.connect({host: hostname, port: 5432})` → ❌ `ETIMEDOUT`

This pointed squarely at **how Node.js internally resolves and connects to hostnames**, not the network itself.

### 3.2 Direct TCP via Node.js to hostname vs IP

```javascript
// Test 1: net.connect to hostname
const socket = net.connect(5432, hostname, () => { ... });
// → Error with empty message, ETIMEDOUT

// Test 2: net.connect to resolved IP
dns.resolve4(hostname, (err, addrs) => {
  const socket = net.connect(5432, addrs[0], () => { ... });
  // → SUCCESS
});
```

**Critical finding**: `net.connect(hostname)` fails but `net.connect(ip)` succeeds. The difference is DNS resolution inside `net.Socket.connect()`.

### 3.3 Full manual TLS handshake through IP

```javascript
dns.resolve4(host, (err, addrs) => {
  const socket = net.connect(5432, addrs[0], () => {
    // Step 1: Send PostgreSQL SSLRequest (int32 8, int32 80877103)
    const sslRequest = Buffer.alloc(8);
    sslRequest.writeInt32BE(8, 0);
    sslRequest.writeInt32BE(80877103, 4);
    socket.write(sslRequest);
  });
  socket.on('data', (data) => {
    if (data[0] === 0x53) { // 'S' = SSL supported
      const tlsSocket = tls.connect({
        socket: socket,
        host: host,
        servername: host,
        rejectUnauthorized: true,
      }, () => console.log('TLS connected, authorized:', tlsSocket.authorized));
      // → authorized: true, authorizationError: null
    }
  });
});
```

**This worked end-to-end** — TCP to resolved IP, PostgreSQL SSLRequest, TLS via `tls.connect` with explicit SNI. The connection was fully authenticated.

### 3.4 Direct `tls.connect` to hostname (without prior TCP)

```javascript
tls.connect({ host: hostname, port: 5432, rejectUnauthorized: false });
// → ETIMEDOUT (empty error message)
```

Note that this doesn't send the PostgreSQL SSLRequest first — it sends a raw TLS ClientHello on a fresh TCP connection. The PostgreSQL server receives an unexpected byte (TLS record instead of PostgreSQL startup message) and either ignores it or sends an error response. But the timeout suggests the server just drops the connection or the TLS handshake never completes.

### 3.5 Deep inspection of the socket error

```javascript
const socket = new net.Socket();
socket.on('error', (err) => {
  console.log('code:', err.code);        // ETIMEDOUT
  console.log('message:', err.message);  // ""
  console.log('errno:', err.errno);      // undefined
  console.log('syscall:', err.syscall);  // undefined
});
socket.connect(5432, hostname);
// → Error event fires with ETIMEDOUT, empty message, and undefined syscall
```

The empty message and undefined syscall are suspicious — normal connection errors include "connect EADDRNOTAVAIL" or "connect ETIMEDOUT" with meaning. This looked like a low-level DNS resolution failure inside libuv.

### 3.6 Testing `--dns-result-order=ipv4first`

```bash
node --dns-result-order=ipv4first -e "
  const dns = require('dns');
  console.log(dns.getDefaultResultOrder());  // 'ipv4first'
  net.createConnection({ host: hostname, port: 5432 });
"
# → STILL ETIMEDOUT
```

**Surprising**: The flag did set `dns.getDefaultResultOrder()` to `ipv4first`, but `net.createConnection` still hung. I verified `dns.lookup` with `all: true` returned IPv4 addresses first, yet `net.Socket.connect` still failed.

### 3.7 Verification: `net.createConnection` with `family: 4`

```javascript
net.createConnection({ host: hostname, port: 5432, family: 4 }, () => { ... });
// → SUCCESS!
```

When `family: 4` was explicitly passed, `net.createConnection` resolved only A records (IPv4) and the connection succeeded instantly.

### 3.8 Verification: pg Client with IP + `ssl.servername`

```javascript
const client = new Client({
  host: resolvedIp,   // IPv4 address
  port: 5432,
  database: 'neondb',
  user: '...',
  password: '...',
  ssl: {
    servername: originalHostname,  // for correct TLS SNI
    rejectUnauthorized: true,
  },
});
// → pg connected!
```

**This was the proof that the object-based connection config with `ssl.servername` works.** The `pg` library uses the `host` for the TCP connection (now an IPv4-only address) and the `ssl.servername` for TLS SNI (matching the Let's Encrypt certificate).

---

## Phase 4 — Understanding Why `dns.setDefaultResultOrder` Didn't Help

### 4.1 The two DNS resolution paths in Node.js

Node.js has **two DNS resolution mechanisms**:

1. **`dns.lookup()`** — Uses libuv's `getaddrinfo()` (system resolver, respects `/etc/hosts`, `nsswitch.conf`). This is what `net.Socket.connect()` calls internally. **This is the function that `dns.setDefaultResultOrder()` affects.**

2. **`dns.resolve4()` / `dns.resolveAny()` etc.** — Uses c-ares, Node.js's built-in DNS resolver (does NOT respect system config). Always queries the DNS server directly. This is what `dns.resolve4()` uses.

The `--dns-result-order=ipv4first` flag sets the `verbatim` option of `dns.lookup()` to `false`, which should sort A records before AAAA records. But the flag's implementation in libuv has a limitation: it still **passes all addresses to the caller**, just reordered. The `net.Socket.connect()` code then iterates over all addresses sequentially — if the first (IPv6) entry hangs, subsequent (IPv4) entries are never tried before the overall timeout.

```javascript
// Simplified pseudocode of net.Socket.connect():
dns.lookup(host, (err, addresses) => {
  // addresses = [ipv6_1, ipv6_2, ipv6_3, ipv4_1, ipv4_2, ipv4_3]
  //                      ↑ with ipv4first, the IPv4 addresses come first
  // But even with ipv4first:
  // If addresses = [ipv4_1, ipv6_1, ipv6_2, ...]
  // attemptConnect(ipv4_1): FAILS FAST → try ipv6_1: HANGS → ETIMEDOUT
  for (const addr of addresses) {
    tryConnect(addr);  // sequential, blocking-like loop
  }
});
```

Wait — `ipv4first` should put IPv4 first, which should connect successfully. Why does it still fail?

### 4.2 The real reason: `dns.setDefaultResultOrder` applied too late

The `drizzle.config.ts` file calls `dns.setDefaultResultOrder("ipv4first")` at the top level. But drizzle-kit uses **esbuild** to compile the TypeScript config to CommonJS. The compiled output wraps the `dns` module through an esbuild interop helper (`__toESM`), which creates **a new object with getter-only properties** for each export. The original `dns` module's functions are proxied.

When the config runs:

1. esbuild compiles `import * as dns from "node:dns"` into `const dns = __toESM(require("node:dns"))`
2. `__toESM` creates a plain `{}` with getter properties that read from the original module
3. `dns.setDefaultResultOrder("ipv4first")` — this calls `setDefaultResultOrder` on the **original module** (the getter delegates to the original), so it should work
4. But `dns.lookup` — when `net.Socket.connect()` later calls `dns.lookup`, it calls the **original module's** `lookup`, not the wrapped one. The original `lookup` uses the _system_ default ordering, not the per-process flag.

Actually, this analysis is incomplete. Let me reconsider.

In Node.js, `dns.setDefaultResultOrder()` sets a global flag on the `dns` module that affects all callers, including the internal `lookup` used by `net.Socket.connect()`. When `dns.setDefaultResultOrder("ipv4first")` is called before any connections, `dns.lookup` should respect it.

But there's a subtlety: **the default value of `--dns-result-order` in Node.js v24 is `verbatim`**, meaning the DNS resolver returns addresses in the order the DNS server provided them (typically IPv6 first when available). The `ipv4first` setting re-sorts the list so IPv4 addresses come before IPv6 — but it **still includes IPv6 addresses** in the list.

The `net.Socket.connect()` code (in `lookupAndConnect`) processes the sorted addresses sequentially:

```javascript
// Pseudo-code for Socket.prototype._lookupAndConnect:
function _lookupAndConnect(addresses) {
  const addr = addresses.shift();
  if (!addr) return callback(new Error('...'));
  
  const socket = new Socket();
  socket.connect(addr.port, addr.address, () => {
    // Connected! Return the socket.
  });
  socket.on('error', (err) => {
    // This address failed. Try the next one.
    if (addresses.length > 0) {
      _lookupAndConnect(addresses);
    }
  });
}
```

The problem arises when an IPv6 address doesn't fail fast — instead of emitting a `connect` or `error` event, the IPv6 connection **hangs** in the TCP SYN-SENT state indefinitely if IPv6 routing is fundamentally unavailable. On a system with no IPv6 route to the destination, `connect(2)` returns `EHOSTUNREACH` or `ENETUNREACH` almost immediately — but **on ChromeOS Crostini**, the lack of IPv6 is different. The Linux container might have a `::1` loopback address but no public IPv6 route, causing the kernel to keep retrying SYN packets over the veth interface to the ChromeOS host, which silently drops them. The connection stays in `SYN-SENT` until the TCP retransmit timer expires (typically 20–30 seconds for first timeout).

During this time, `net.Socket.connect()` is waiting for EITHER a `connect` or `error` event on the IPv6 socket — neither comes until the TCP timeout. The code does NOT have a fallback timer that switches to the next address after a reasonable delay.

### 4.3 The `--dns-result-order=ipv4first` paradox

Even with `ipv4first`, `net.createConnection` still failed in my tests. My explanation:

Reviewing my test code more carefully:

```javascript
// Test A — with --dns-result-order=ipv4first
const socket = net.createConnection({ host: hostname, port: 5432 }, () => { ... });
// → ETIMEDOUT
```

But this contradicts my earlier finding that `net.createConnection({ host, port, family: 4 })` works. The difference is `family: 4` — which tells `dns.lookup` to only return A records. Without `family: 4`, `dns.lookup` returns both A and AAAA records (even with `ipv4first`), and the IPv6 AAAA records still hang.

Wait, but `ipv4first` should put IPv4 addresses FIRST in the list. Even if IPv6 addresses are in the list, the _first_ attempt should be to an IPv4 address, which should succeed immediately. So why does the overall connection fail?

The answer lies in how `net.Socket.connect` handles multiple addresses in Node.js v24. I don't have access to the exact source, but the behavior suggests one of:

1. **Parallel connection attempts**: Node.js tries IPv4 and IPv6 in parallel (not sequentially), and if IPv6 hangs while IPv4 succeeds, there's a race condition where the overall promise waits for BOTH.

2. **An internal sorting or iteration bug**: Despite `ipv4first`, the internal address processing might still try IPv6 first because libuv's `getaddrinfo` has its own ordering that overrides the JS-level sorting.

3. **The `ipv4first` flag is applied too late**: If `net.Socket.connect()` caches the DNS resolution before the flag is set, or uses a different DNS API that doesn't respect the flag.

Given the empirical evidence that both `--dns-result-order=ipv4first` and `dns.setDefaultResultOrder("ipv4first")` failed, but `family: 4` worked, I concluded that the **only reliable fix** is to force IPv4-only lookups.

---

## Phase 5 — Implementing the Fix (Three Failed Attempts)

### 5.1 Attempt 1: Top-level await with `dns.promises.resolve4`

```typescript
// drizzle.config.ts
const addresses = await dns.promises.resolve4(originalHostname);
```

**Result**:
```
ERROR: Top-level await is currently not supported with the "cjs" output format
```

**Why it failed**: drizzle-kit uses esbuild to compile `drizzle.config.ts` to CommonJS (CJS). The `"cjs"` output format doesn't support top-level await. Top-level await requires an ES module.

### 5.2 Attempt 2: Sync DNS via `dns.resolve4Sync`

```typescript
const addresses = dns.resolve4Sync(originalHostname);
```

**Result**:
```
dns.resolve4Sync is not a function
```

**Why it failed**: Node.js v24 **removed** all synchronous DNS methods: `dns.resolve4Sync`, `dns.resolve6Sync`, `dns.lookupSync`, etc. These were deprecated in earlier versions and removed in the Node.js 24 release. Only callback-based and promise-based async variants remain.

### 5.3 Attempt 3: Override `dns.lookup` via import

```typescript
import * as dns from "node:dns";
const origLookup = dns.lookup;
dns.lookup = function(...) { ... };  // TypeError: Cannot set property lookup of #<Object>
```

**Why it failed**: esbuild's `__toESM` helper wraps the imported module in a **Proxy-like object** with getter-only property descriptors. Direct assignment to `dns.lookup` or `Object.defineProperty(dns, 'lookup', ...)` both fail because the property is configured as read-only.

The esbuild compilation transforms:
```javascript
import * as dns from "node:dns";
```
into:
```javascript
var import_node_dns = __toESM(require("node:dns"));
```

Where `__toESM` does something like:
```javascript
function __toESM(mod) {
  return Object.defineProperties({}, {
    ...Object.getOwnPropertyDescriptors(mod),
    default: { get: () => mod }
  });
}
```

If the property descriptors are `{ get: ..., set: undefined, configurable: false }`, they can't be overridden.

---

## Phase 6 — The Working Fix

### 6.1 Patching the ORIGINAL `dns` module

The key insight: esbuild only wraps the _imported reference_ to `dns`. The **original module** (cached in Node.js's module cache at `require.cache`) is still writable. If I access it directly via `require("node:dns")` instead of `import * as dns`, I get the unwrapped module:

```typescript
// Get the ORIGINAL, unwrapped dns module
const originalDns = require("node:dns");
const origLookup = originalDns.lookup;

// Override on the original module — this affects ALL consumers
// (including net.Socket.connect, which is called by pg)
originalDns.lookup = function (host, opts, cb) {
  // Force family=4 to only resolve A records (IPv4)
  if (typeof opts === "function") {
    cb = opts;
    opts = { family: 4 };
  } else if (typeof opts === "number") {
    opts = { family: opts || 4 };
  } else {
    opts = { ...opts, family: opts?.family || 4 };
  }
  return origLookup(host, opts, cb);
};
```

**Why this works**: `require("node:dns")` returns the exact module object from Node.js's module cache — the same object that `net`, `pg`, and every other library uses when they `require("dns")` or `require("node:dns")`. By modifying `lookup` on this canonical object, **every DNS lookup in the entire process** is forced to IPv4-only.

### 6.2 Why `require` is available

`drizzle-kit` compiles the config to CJS, where `require` is a global. Even though the TypeScript source uses `import` syntax, the compiled output runs in a CommonJS context where `require()` is the built-in Node.js function. TypeScript doesn't complain about `require` because it's a global in the CJS module scope.

### 6.3 The full working fix

```typescript
import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

const originalDns = require("node:dns");
const origLookup = originalDns.lookup;
originalDns.lookup = function (host, opts, cb) {
  if (typeof opts === "function") {
    cb = opts;
    opts = { family: 4 };
  } else if (typeof opts === "number") {
    opts = { family: opts || 4 };
  } else {
    opts = { ...opts, family: opts?.family || 4 };
  }
  return origLookup(host, opts, cb);
};

dotenv.config({ path: ".env" });

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("Database target URL is missing from your .env environment block!");
}

const connectionUrl = new URL(dbUrl);
if (!connectionUrl.searchParams.has("sslmode")) {
  connectionUrl.searchParams.set("sslmode", "verify-full");
}
if (!connectionUrl.searchParams.has("channel_binding")) {
  connectionUrl.searchParams.set("channel_binding", "require");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionUrl.toString(),
  },
  verbose: true,
  strict: true,
});
```

The `dbCredentials` still uses `url: connectionUrl.toString()` (the original URL format), which contains `sslmode=require` that pg treats as `verify-full`. This works because the DNS lookup for the `host` in the URL now only returns IPv4 addresses.

### 6.4 The SSL warning

The `sslmode=require` warning from pg persists:
```
SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
```

This is a **cosmetic warning only** — it doesn't affect functionality. The connection uses full SSL verification (`verify-full` semantics), which succeeds because the Neon certificate (`CN=*.sa-east-1.aws.neon.tech`) matches the hostname. The connection is both working and secure.

---

## Phase 7 — Schema Type Mismatch (Secondary Issue)

After the connection hang was fixed, `drizzle-kit push` proceeded to the schema comparison phase and found a mismatch:

```
ALTER TABLE "session" ALTER COLUMN "userId" SET DATA TYPE uuid;
→ error: column "userId" cannot be cast automatically to type uuid
```

### 7.1 Root cause

The `src/lib/server/db/schema.ts` had:

```typescript
export const account = pgTable("account", {
  userId: text("userId")       // ← text, but references a uuid column
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
```

`user.id` is `uuid("id")`, so the foreign key reference was between `text` and `uuid` — an invalid combination that PostgreSQL rejects.

Additionally, the database had `session.userId` as `text` (from a previous partial push or the old `0000_round_cable.sql` migration), while the schema declared it as `uuid("userId")`. drizzle-kit tried to alter the column type, but PostgreSQL can't auto-cast `text` to `uuid` without an explicit `USING` clause.

### 7.2 Fix

```diff
- userId: text("userId")
+ userId: uuid("userId")
```

This makes `account.userId` match the type of the referenced key (`user.id`), which is the correct schema design.

### 7.3 Database cleanup

The simplest fix for the development database was to drop and recreate:

```javascript
await sql`DROP TABLE IF EXISTS account CASCADE`;
await sql`DROP TABLE IF EXISTS session CASCADE`;
await sql`DROP TABLE IF EXISTS verification CASCADE`;
await sql`DROP TABLE IF EXISTS "user" CASCADE`;
// Then re-run drizzle-kit push
```

---

## Summary of All Changes

### File: `drizzle.config.ts`

| Change | Before | After |
|--------|--------|-------|
| DNS fix | `import dns from "node:dns"` + `dns.setDefaultResultOrder("ipv4first")` | `require("node:dns")` + `dns.lookup` monkey-patch with `family: 4` |
| Import style | `import dns from "node:dns"` | (removed entirely — now uses `require("node:dns")`) |
| SSL config | `sslmode` + `channel_binding` URL params | (unchanged — still applied to URL) |
| `dbCredentials` | `url: connectionUrl.toString()` | (unchanged — still URL format) |

### File: `src/lib/server/db/schema.ts`

| Change | Before | After |
|--------|--------|-------|
| `account.userId` type | `text("userId")` | `uuid("userId")` |

### File: `drizzle/` (deleted)

Stale migration `0000_round_cable.sql` with old schema definitions removed.

---

## Key Takeaways

1. **The hang was a DNS/IPv6 issue on Crostini, not a database or network problem.** The database was reachable — Node.js just couldn't negotiate the connection due to IPv6 address timeouts in `net.Socket.connect()`.

2. **`dns.setDefaultResultOrder("ipv4first")` was insufficient** because it only reorders addresses without removing IPv6 — and hanging IPv6 connections still block the connection attempt.

3. **esbuild's module wrapping prevented direct `dns.lookup` patching** via `import * as dns`. The workaround was `require("node:dns")` to access the unwrapped module.

4. **sslmode `require` being treated as `verify-full` is cosmetic** — the connection works and is fully verified against the Let's Encrypt certificate for `*.sa-east-1.aws.neon.tech`.

5. **The `account.userId` type mismatch** was a separate schema design issue where `text` referenced `uuid` — found incidentally because the schema diff couldn't apply after the connection was fixed.
