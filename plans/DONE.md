# Phase 0 — The Base: Complete

## Architecture

- [x] **Single SvelteKit full-stack app** — NestJS backend eliminated; client and server collapsed into one SvelteKit project deployed on Vercel
- [x] **Cross-domain cookie issues resolved** — all API routes and frontend live on the same origin

## Authentication & Security

- [x] **BetterAuth** integrated as the sole auth provider with:
  - Email/password authentication with Argon2 hashing
  - GitHub OAuth provider
  - Google OAuth provider
  - Account linking across providers
- [x] **Session management** via `hooks.server.ts` — session parsed on every request, injected into `event.locals`
- [x] **Auth guard on all dashboard routes** — `dashboard/+layout.server.ts` redirects unauthenticated users to `/signin`
- [x] **Onboarding guard** — un-onboarded users redirected to `/onboarding` from any route except signin/signup/onboarding/api
- [x] **Role-based access** — admin plugin with admin-by-email auto-assignment; role request/approval workflow

## Database

- [x] **PostgreSQL** via Neon serverless
- [x] **Drizzle ORM** with full TypeScript schema:
  - `user` — core user ledger with onboarding, consent, and deletion fields
  - `session` — token ledger
  - `account` — provider mapping (credential + OAuth)
  - `verification` — cryptographic nonce store
  - `role_request` — role upgrade requests
- [x] **Migration pipeline** via `drizzle-kit` (push, generate, migrate, studio)

## Account Lifecycle

- [x] **Grace-period deletion** — 30-day pending_delete state before permanent removal
- [x] **Inngest function** `delayedAccountDeletion` — triggered on `user/deletion.requested`, sleeps 30d, cancellable via `user/deletion.cancelled` (matched by `data.userId`), hard-deletes via `auth.api.deleteUser`
- [x] **Auto-restore** — OAuth auto-restore in `hooks.server.ts`, email sign-in auto-restore in `signin/+page.server.ts` with alert to user
- [x] **Delete confirmation email** sent on request, **restore notification** sent on recovery

## Email System

- [x] **Resend SDK** for transactional emails
- [x] All emails personalized with recipient name (`Hi, {name}!`)
- [x] `sendVerificationEmail` — email verification
- [x] `sendResetPasswordEmail` — password reset
- [x] `sendAccountDeletionConfirmation` — deletion scheduled notification
- [x] `sendAccountRestored` — account restored notification
- [x] `sendWelcomeEmail` — sent on onboarding completion

## Routes

- [x] `/signin` — email/password and OAuth sign-in with pending-deletion alert
- [x] `/signup` — account registration with password confirmation
- [x] `/onboarding` — multi-step profile setup (legal consents, display name, bio, interests, specialty, skill level)
- [x] `/onboarding/complete` — welcome confirmation with link to dashboard
- [x] `/dashboard` — minimal authenticated page (greeting + sign-out)
- [x] `/dashboard/settings` — account deletion with password confirmation
- [x] `/dashboard/request-role` — role upgrade requests
- [x] `/dashboard/admin/role-requests` — admin role approval/rejection
- [x] `/forgot-password` — password reset request
- [x] `/reset-password` — set new password via token
- [x] `/(markdown)/terms` — terms of service
- [x] `/(markdown)/privacy` — privacy policy
- [x] `/(markdown)/marketing` — marketing communications
- [x] `/api/inngest` — Inngest serve handler

## UI Components

- [x] **shadcn-svelte** components: Button, Input, Label, Card, Badge, Table, Avatar, DropdownMenu, Dialog, Drawer, Sheet, Tooltip, Select, Tabs, Separator, Skeleton, Checkbox, Spinner, Alert, Field, Toggle, ThemeSwitcher
- [x] **Login form** with email + password + OAuth (GitHub, Google)
- [x] **Signup form** with password confirmation + OAuth
- [x] **Alert component** for inline notifications

## Styling

- [x] **Tailwind CSS v4**
- [x] **Dark mode** via `mode-watcher`
- [x] **Typography** base styles for markdown content (prose layout under `(markdown)` route group)
- [x] **Font sources**: Geist, Inter, JetBrains Mono variable fonts
- [x] **Favicon** via `/favicon_io/`

## Cleanup (Phase 0 Polish)

- [x] Fixed `/login` → `/signin` redirects in admin/role-requests and request-role pages
- [x] Added auth guard to `dashboard/+layout.server.ts` (previously empty)
- [x] Removed `demo/` route group (leftover BetterAuth migration scaffolding)
- [x] Removed `signout/` route (redundant — dashboard has its own signOut action)
- [x] Removed dead `signUpEmail` action from `signin/+page.server.ts`
- [x] Removed `vitest-examples/` (starter boilerplate)
- [x] Uninstalled unused packages: `@internationalized/date`, `@types/d3-scale`, `@types/d3-shape`
- [x] Inngest client made lazy to avoid SSR fetch warning
- [x] Email personalization added to all 5 email functions
