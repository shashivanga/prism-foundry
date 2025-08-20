# Alltech Backend MVP — End-to-End Implementation Checklist (Supabase + Next.js)

> Copy into Google Docs and tick each box as you complete it. When all boxes are checked, the backend MVP is done and safely integrated with your Lovable frontend.

---

## 0) Project Bootstrap & Environment

* [ ] Create Supabase project (Production org/workspace).
* [ ] Create `.env.local` in Next.js app with:

  * [ ] `NEXT_PUBLIC_SUPABASE_URL=…`
  * [ ] `SUPABASE_SERVICE_ROLE=…` *(server only — never expose to client)*
  * [ ] `SUPABASE_ANON_KEY=…`
  * [ ] `AI_PROVIDER=OPENAI` *(or other)*
  * [ ] `OPENAI_API_KEY=…` *(server only)*
  * [ ] `NEXT_PUBLIC_BACKEND_ENABLED=true`
  * [ ] `JWT_SECRET` *(if you sign your own tokens; otherwise Supabase JWT is fine)*
* [ ] Install server deps: `zod`, `@supabase/supabase-js`, `pino`, `helmet`, `@sentry/nextjs` (optional), `uuid`.
* [ ] Create shared server utils:

  * [ ] `lib/supabaseServer.ts` (admin & user clients)
  * [ ] `lib/http.ts` (json, error helpers, rate-limit helper)
  * [ ] `lib/authServer.ts` (getUserFromRequest, role checks)
  * [ ] `lib/validation.ts` (Zod schemas)
  * [ ] `lib/logger.ts` (Pino instance)

---

## 1) Database Schema (Supabase Postgres)

* [ ] Create ENUMs (or checks): `role_enum('client','pm','admin')`, `feedback_status('open','in_progress','resolved')`, `feedback_category('bug','enhancement','scope','question')`, `impact_tag('timeline','effort','scope')`.
* [ ] Create **tables** (all with `created_at timestamptz default now()`):

  * [ ] `users(id uuid pk, email text unique, role role_enum, full_name text)`
  * [ ] `projects(id uuid pk, name text, client_name text, owner_user_id uuid fk users, description text, updated_at timestamptz)`
  * [ ] `prd_versions(id uuid pk, project_id uuid fk, version int, content_md text, content_json jsonb, created_by uuid fk users)`
  * [ ] `mvp_specs(id uuid pk, project_id uuid fk, prd_version_id uuid fk, spec_md text, spec_json jsonb, tasks jsonb, model text)`
  * [ ] `builds(id uuid pk, project_id uuid fk, mvp_spec_id uuid fk, preview_url text)`
  * [ ] `share_links(id uuid pk, project_id uuid fk, build_id uuid fk, token text unique, expires_at timestamptz, is_revoked boolean default false)`
  * [ ] `feedback_items(id uuid pk, project_id uuid fk, share_link_id uuid fk, build_id uuid fk, author_email text, role text, category feedback_category, text text, in_scope boolean, contradiction_of_ids jsonb, status feedback_status)`
  * [ ] `change_logs(id uuid pk, project_id uuid fk, from_prd_version int, to_prd_version int, delta_json jsonb, summary_md text)`
  * [ ] `audit_events(id uuid pk, actor uuid fk users, project_id uuid fk projects, type text, payload jsonb)`
  * [ ] *(Optional governance)* `decisions(id uuid pk, project_id uuid fk, source_type text, source_id text, rationale text, impact jsonb, created_by uuid fk users)`
* [ ] Add **constraints & indexes**:

  * [ ] `unique(project_id, version)` on `prd_versions`
  * [ ] FKs indexed on all child tables
  * [ ] `share_links.token unique`
  * [ ] `projects(owner_user_id)`, `(created_at)`, `(updated_at)`
  * [ ] `feedback_items(status)`, `feedback_items(category)`
* [ ] Save as SQL migrations in repo (e.g., `/supabase/migrations/2025…sql`) and run.

---

## 2) Authentication & RLS (Row-Level Security)

* [ ] Enable RLS on **all** business tables.
* [ ] `users` policies:

  * [ ] self can `select`/`update` profile fields; admin can `select`/`update` all; no role self-elevation.
* [ ] `projects` policies:

  * [ ] clients: `select/insert` where `owner_user_id = auth.uid()`
  * [ ] pm/admin: `select` all; `insert/update` per internal ops
* [ ] Child tables (`prd_versions`, `mvp_specs`, `builds`, `feedback_items`, `change_logs`, `decisions`, `audit_events`):

  * [ ] clients: `select` when `project_id` belongs to them, insert feedback & prd (as allowed)
  * [ ] pm/admin: `select/insert/update` as required
* [ ] **Share links:** no direct public RLS. Access only via **server route** using Service Role.
* [ ] Verify policies with 3 actors (client, pm, admin) in Supabase SQL editor.

---

## 3) API Surface (Next.js Route Handlers + Zod)

**Foundations**

* [ ] Create `/app/api/_middlewares` (rate limiting helper, error handler).
* [ ] Create `/app/api/_schemas` (Zod schemas for request/response).
* [ ] Create `/app/api/_auth` (decode Supabase JWT, attach user/role).

**Auth**

* [ ] `POST /api/auth/signup` (Supabase Auth)
* [ ] `POST /api/auth/login` (Supabase Auth)
* [ ] `POST /api/auth/logout`
* [ ] `GET /api/me` (returns user + role)

**Projects & PRD**

* [ ] `GET /api/projects` (RLS-scoped)
* [ ] `POST /api/projects` (create)
* [ ] `GET /api/projects/:id`
* [ ] `GET /api/projects/:id/prd` (list latest → first)
* [ ] `POST /api/projects/:id/prd` (create **new** version; validates uniqueness)

**Specs & Builds**

* [ ] `GET /api/projects/:id/spec`
* [ ] `POST /api/projects/:id/spec` (persist generated spec)
* [ ] `GET /api/projects/:id/build`
* [ ] `POST /api/projects/:id/build` (set preview\_url)

**Share Links & Public Review**

* [ ] `POST /api/projects/:id/share` (create token, optional expiry)
* [ ] `POST /api/projects/:id/share/revoke` (by id or token)
* [ ] `GET /api/share/:token/resolve` *(public)* returns **minimal** payload (project name, preview\_url, spec summary, latest diff summary)
* [ ] `POST /api/review/:token/feedback` *(public write)*

**Feedback & Decisions**

* [ ] `GET /api/projects/:id/feedback`
* [ ] `PATCH /api/internal/feedback/:id` (triage fields: `in_scope`, `status`, `contradiction_of_ids`, optional `decision_rationale` + `impact[]`)
* [ ] `POST /api/decisions` (when governance captured separately)

**Diff & AI**

* [ ] `POST /api/diff/prd` (from\_version,to\_version) → `{delta_json, summary_md}`; also persists `change_logs`
* [ ] `POST /api/ai/generate-spec` (server-only; calls provider; returns spec + tasks; persists)

**Audit**

* [ ] All mutations call `logAudit(eventType, payload)` to insert into `audit_events`.

**Validation & Errors**

* [ ] Every handler validates input via Zod and returns typed responses.
* [ ] Errors are standardized: `{ error: { code, message, details? } }`.

---

## 4) Security & Public Surface

* [ ] Use **Service Role** only in server codepaths (never client).
* [ ] Rate-limit public endpoints (`/share/:token/resolve`, `/review/:token/feedback`) by IP (e.g., token bucket, 60/min).
* [ ] Implement **revocation & expiry** checks server-side for tokens.
* [ ] Add `helmet` or secure headers middleware for API:

  * [ ] Strict `Content-Security-Policy` for review pages (if iframe)
  * [ ] `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
* [ ] CORS locked to your frontend origins; public endpoints allow only GET/POST with tight rules.

---

## 5) Business Logic Hooks (Server-Side Invariants)

* [ ] On `POST /projects/:id/prd`:

  * [ ] Enforce `version = (max(version)+1)` per project.
  * [ ] Normalize PRD JSON server-side if raw text is posted.
  * [ ] Trigger diff vs previous (if exists) → persist `change_logs`.
  * [ ] Audit: `PRD_SUBMITTED`.
* [ ] On `POST /projects/:id/spec`:

  * [ ] Verify PRD exists; link `prd_version_id`.
  * [ ] Persist `{spec_md,spec_json,tasks,model}`.
  * [ ] Audit: `SPEC_GENERATED`.
* [ ] On `POST /projects/:id/build`:

  * [ ] Link to latest spec (if supplied) and preview\_url.
  * [ ] Audit: `BUILD_CREATED`.
* [ ] On `POST /projects/:id/share`:

  * [ ] Generate cryptographically strong token.
  * [ ] Optional expiry; store `is_revoked=false`.
  * [ ] Audit: `SHARE_CREATED`.
* [ ] On `POST /api/review/:token/feedback`:

  * [ ] Resolve token → project/build.
  * [ ] Insert `feedback_items` with role=`client` or `external`.
  * [ ] Audit: `FEEDBACK_ADDED`.
* [ ] On `PATCH /api/internal/feedback/:id`:

  * [ ] If setting `in_scope=false` or resolving contradiction, require `decision_rationale` + `impact[]`; optionally also insert a `decisions` row.
  * [ ] Audit: `TRIAGE_UPDATED`.

---

## 6) Observability & Ops

* [ ] Add **server logging** (Pino) for each endpoint (trace: route, actor, project\_id, status, latency).
* [ ] Integrate **Sentry** for server exceptions (optional but recommended).
* [ ] Create **cron** (Supabase scheduled functions):

  * [ ] Nightly: expire `share_links` past `expires_at`.
  * [ ] Weekly: soft-archive old `audit_events` if needed.
* [ ] Create `/health` route that checks DB connectivity and returns 200.

---

## 7) Test Plan (Manual + Automated)

**Automated (happy paths)**

* [ ] Unit test diff function on sample PRDs.
* [ ] Unit test Zod schemas (invalid/edge cases).
* [ ] Route tests (Next.js API) for:

  * [ ] Auth login/signup
  * [ ] Projects list (client vs pm/admin)
  * [ ] PRD submit + change log creation
  * [ ] Spec generate persist
  * [ ] Share link resolve (public)
  * [ ] Public feedback submit
  * [ ] Triage patch rules

**Manual**

* [ ] Postman/Thunder collection with all endpoints and example bodies.
* [ ] Three test accounts: `client@…`, `pm@…`, `admin@…`.
* [ ] End-to-End script:

  * [ ] Client creates project + PRD v1
  * [ ] PM generates spec + build + share link
  * [ ] Client opens token, submits feedback
  * [ ] PM triages, records decision, requests PRD v2
  * [ ] System computes diff; repeat

---

## 8) Frontend Integration Switch-Over

* [ ] Add `services/api.ts` on frontend for all calls (thin wrappers).
* [ ] Feature flag: if `NEXT_PUBLIC_BACKEND_ENABLED=true`, read/write via API; else fallback to local store (for dev).
* [ ] Replace:

  * [ ] Projects list → `GET /api/projects`
  * [ ] PRD submit → `POST /api/projects/:id/prd`
  * [ ] Spec viewer → `GET /api/projects/:id/spec`
  * [ ] Generate spec → `POST /api/ai/generate-spec` then persist via `POST /projects/:id/spec`
  * [ ] Build + share → `POST /api/projects/:id/build`, `POST /projects/:id/share`
  * [ ] Review page → `GET /api/share/:token/resolve`
  * [ ] Feedback submit → `POST /api/review/:token/feedback`
  * [ ] Feedback triage → `PATCH /api/internal/feedback/:id`
* [ ] Remove any lingering direct localStorage writes when backend flag is on.

---

## 9) Data Migration (if you have existing local data)

* [ ] Build frontend **Export** (JSON) from local store: users, projects, prd\_versions, mvp\_specs, builds, share\_links, feedback\_items, change\_logs.
* [ ] Build backend **Import** route or script (service role):

  * [ ] Validate rows; map local user ids → Supabase `users.id`
  * [ ] Insert in dependency order (users → projects → prd\_versions → mvp\_specs → builds → share\_links → feedback → change\_logs)
* [ ] Spot-check a migrated project end-to-end.

---

## 10) Production Hardening & Go-Live

* [ ] Rotate keys; confirm `.env` never checked in.
* [ ] Verify RLS with three roles using raw SQL.
* [ ] Confirm public endpoints return **only** minimal review payload (no PII leakage).
* [ ] Confirm rate limits work (429 observed under simple load).
* [ ] Set CORS to final production domains.
* [ ] Enable database backups and PITR in Supabase.
* [ ] Document **incident response** (key revoke steps, token invalidation).
* [ ] Final smoke test on production URL with fresh accounts.

---

## 11) "Definition of Done" — Backend MVP

* [ ] All tables, indexes, RLS policies applied and versioned in migrations.
* [ ] All listed API endpoints implemented, validated (Zod), and audited.
* [ ] Public review link flow (create → resolve → feedback) works without auth, with revocation/expiry and rate limiting.
* [ ] Diff service writes `change_logs` on PRD submit; decisions captured when required.
* [ ] Frontend reads/writes via backend when flag is enabled; local fallback removed for prod.
* [ ] Logs, error capture, and health route in place; cron jobs active.
* [ ] Postman collection updated; README with env/setup/run instructions written.
* [ ] Test plan executed (automated + manual); sign-off by PM.

---

### Notes / Quick Links To Keep Handy (add in your doc)

* Supabase Project URL: \_\_\_\_\_\_\_\_
* Admin email(s): \_\_\_\_\_\_\_\_
* API base URL: \_\_\_\_\_\_\_\_
* Frontend production URL(s): \_\_\_\_\_\_\_\_
* Model & provider for AI spec generation: \_\_\_\_\_\_\_\_

---

If you want, I can generate **starter SQL migrations** and **boilerplate route handlers with Zod** for the endpoints above so you can paste them directly into your repo.