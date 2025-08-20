# Database Design for Alltech Client→MVP Workflow

Below is a complete database design for the Alltech client→MVP workflow on Supabase (Postgres + RLS). It's written in a Google-Docs-friendly, paragraph style with clear table purposes, key columns, relationships, lifecycle notes, indexing tips, and RLS policy intent.

## 1) Users

Purpose: Master record for every authenticated person in the system (clients, internal PMs, admins). Drives authorization and ownership of client projects.
Key columns: id (uuid, PK, default gen_random_uuid()), email (text, unique, lowercase), role (enum: 'client'|'pm'|'admin'), full_name (text, optional), created_at (timestamptz, default now()).
Relationships: Referenced by projects.owner_user_id (the client "owner" of a project) and by prd_versions.created_by.
Indexes: email (unique), role.
RLS intent: Users can read their own user row; admins can read all. Updates are limited to profile fields (non-role) by self; role changes are admin-only.

## 2) Projects

Purpose: The central business container tying client requirements, specs, builds, share links, and feedback. One client (owner) can have many projects; internal users (PM/admin) can access projects per policy.
Key columns: id (uuid, PK), name (text, required), client_name (text, required, for display), owner_user_id (uuid, FK → users.id), description (text, optional), created_at (timestamptz), updated_at (timestamptz).
Relationships: One-to-many with prd_versions, mvp_specs, builds, share_links, feedback_items, change_logs, audit_events.
Indexes: (owner_user_id), (created_at), (updated_at).
RLS intent: Clients can SELECT and INSERT projects they own; PM/Admin can SELECT all (and INSERT/UPDATE as per internal workflows). All child tables gate access by joining through project_id.

## 3) PRD Versions (prd_versions)

Purpose: Immutable history of the client's Product Requirements Document submissions and internal edits. Each submission increments version and stores both human-readable Markdown and normalized JSON for computation.
Key columns: id (uuid, PK), project_id (uuid, FK → projects.id, required), version (int, required, unique per project), content_md (text, required), content_json (jsonb, required, normalized schema), created_by (uuid, FK → users.id), created_at (timestamptz).
Relationships: Many PRD versions belong to one project; referenced by mvp_specs.prd_version_id and used by change_logs to compute diffs.
Constraints & indexes: unique(project_id, version), indexes on (project_id, created_at) and (project_id, version).
RLS intent: Clients can read PRD versions for projects they own and create new versions; PM/Admin can read all and (optionally) create internal versions if your workflow allows.

## 4) MVP Specs (mvp_specs)

Purpose: Stores the generated MVP specification for a project, per PRD version. Captures both Markdown (for display) and machine-readable JSON (for tasks and later integration).
Key columns: id (uuid, PK), project_id (uuid, FK → projects.id), prd_version_id (uuid, FK → prd_versions.id), spec_md (text, required), spec_json (jsonb, required), tasks (jsonb array of {story_id,title,priority,tags}), model (text, optional, which AI/model produced it), created_at (timestamptz).
Relationships: One project can have multiple specs over time, each linked to a PRD version; one spec may be referenced by a build.
Indexes: (project_id, created_at), (prd_version_id).
RLS intent: Clients can read specs for their project; PM/Admin can create and update specs.

## 5) Builds (mvp_builds or builds)

Purpose: Links a project/spec to a Preview URL (e.g., Bolt/Lovable), representing what the client will review.
Key columns: id (uuid, PK), project_id (uuid, FK → projects.id), mvp_spec_id (uuid, FK → mvp_specs.id, optional if preview precedes spec), preview_url (text, required), created_at (timestamptz).
Relationships: A project can have many builds (e.g., per iteration). Builds are associated with share_links for review.
Indexes: (project_id, created_at), (mvp_spec_id).
RLS intent: Clients can read builds for their projects; creation typically internal (PM/Admin).

## 6) Share Links (share_links)

Purpose: Tokenized review links for clients/stakeholders to preview the MVP and spec summary. Each token can be time-limited or revoked.
Key columns: id (uuid, PK), project_id (uuid, FK → projects.id), build_id (uuid, FK → builds.id), token (text, unique, required, sufficiently random), expires_at (timestamptz, nullable), is_revoked (boolean, default false), created_at (timestamptz).
Relationships: One project/build can have multiple share links over time; referenced by feedback_items.share_link_id.
Indexes: token (unique), (project_id, created_at), (build_id).
RLS & public access intent: Normal RLS stays strict. Public review endpoints do not use direct table RLS; instead, a server route validates tokens and reads minimal fields using the service role key, returning a sanitized payload. Revocation and expiration are enforced server-side.

## 7) Feedback Items (feedback_items)

Purpose: Stores review feedback captured from public share pages or authenticated users; supports categorization, in-scope tagging, contradiction flags, and status transitions.
Key columns: id (uuid, PK), project_id (uuid, FK → projects.id), share_link_id (uuid, FK → share_links.id, nullable if posted internally), build_id (uuid, FK → builds.id), author_email (text, for non-authed reviewers), role (text: 'client'|'internal'|'external'), category (text: 'bug'|'enhancement'|'scope'|'question' etc.), text (text), in_scope (boolean), contradiction_of_ids (jsonb array of related story IDs), status (text: 'open'|'in_progress'|'resolved'), created_at (timestamptz).
Relationships: Belongs to a project; typically tied to a specific share link and build. Internal triage updates scope flags and status.
Indexes: (project_id, created_at), (build_id), (status), (category).
RLS intent: Clients can read/write feedback on their projects through the app; PM/Admin can read and update triage fields; public write is allowed only via the token-validated server endpoint (no direct table write from unauthenticated clients).

## 8) Change Logs (change_logs)

Purpose: Immutable records of diffs between PRD versions (and optionally spec diffs), used for audit and to highlight ADDED/REMOVED/MODIFIED items.
Key columns: id (uuid, PK), project_id (uuid, FK → projects.id), from_prd_version (int), to_prd_version (int), delta_json (jsonb, structured diff), summary_md (text, human summary), created_at (timestamptz).
Relationships: Belongs to a project and conceptually references two PRD versions.
Indexes: (project_id, created_at), (project_id, to_prd_version).
RLS intent: Visible to the project's client and all internal users; append-only writes by server/business logic.

## 9) Audit Events (audit_events)

Purpose: System-level append-only trail of important actions (e.g., PRD submitted, spec generated, share link created/revoked, feedback triaged). Supports compliance and incident review.
Key columns: id (uuid, PK), actor (uuid, FK → users.id, nullable for public/token actions), project_id (uuid, FK → projects.id, nullable for global events), type (text: e.g., 'PRD_SUBMITTED','SPEC_GENERATED','SHARE_CREATED','FEEDBACK_ADDED','TRIAGE_UPDATED'), payload (jsonb, details and previous/new states), created_at (timestamptz).
Relationships: Soft-links to the project and actor.
Indexes: (project_id, created_at), (type, created_at).
RLS intent: Read access for involved parties (project owner, internal) and admin; writes only via server routes. Never exposed through public endpoints in full detail.

## 10) Decisions (decisions) — optional but recommended for governance

Purpose: Explicit log of scope decisions with required rationale and impact tags (timeline/effort/scope risk) to formalize acceptance of contradictory or out-of-scope changes.
Key columns: id (uuid, PK), project_id (uuid, FK → projects.id), source_type (text: 'feedback'|'change'|'manual'), source_id (uuid or text, stores the originating item ID), rationale (text, required), impact (jsonb array: e.g., ['timeline','effort']), created_by (uuid, FK → users.id), created_at (timestamptz).
Relationships: Belongs to a project; references feedback or change items by id (soft link).
Indexes: (project_id, created_at), (source_type, source_id).
RLS intent: Visible to project owner and internal users; created/updated by PM/Admin only.

## Enumerated Types & Reference Values

role_enum: 'client'|'pm'|'admin'.
feedback_category: 'bug'|'enhancement'|'scope'|'question' (extendable).
feedback_status: 'open'|'in_progress'|'resolved'.
impact_tag: 'timeline'|'effort'|'scope' (extendable).
Using Postgres enums improves integrity; alternatively, store as validated text with check constraints for easier future edits.

## Core Relationships (high-level narrative)

A user (role 'client') owns one or more projects. Each project has a chronological list of PRD versions capturing the client's requirements, which in turn drive MVP specs (generated by internal PMs via AI). For a given spec or iteration, internal users create builds pointing to a preview URL. To collect structured client feedback with minimal friction, internal users issue share links (tokenized review URLs) that resolve to read-only review pages (public endpoint validates token, then serves only the subset of data needed). Clients and stakeholders submit feedback items through that page; internal users triage and optionally record decisions (with rationale/impact). Every significant action writes to audit events. When a new PRD version is submitted, a change log captures a computed diff to keep scope tight and the audit trail complete.

## Indexing & Constraint Guidance

Use UUID PKs with gen_random_uuid(). Guarantee unique(project_id, version) on PRD versions. Index every FK (project_id, prd_version_id, build_id, share_link_id) and time columns used in lists (created_at, updated_at). Add a strict unique index on share_links.token. For fast triage, index feedback_items(status) and feedback_items(category). Consider partial index on share_links(is_revoked) where is_revoked = true and on share_links(expires_at) for cleanup queries.

## RLS (Row-Level Security) Intent Summary

Enable RLS on all business tables. Ownership and visibility flow from projects. Clients may SELECT and INSERT their own projects and read all child rows for those projects; PM/Admin can read (and generally write) all rows. Public review uses server routes that validate the token, then perform a minimal, read-only query with the service role; the frontend never queries tokenized data directly against RLS tables. Mutations (PRD submit, spec generate, triage) occur via authenticated server routes to ensure audit logging and policy enforcement.

## Lifecycle Notes & Data Hygiene

PRDs are append-only per version; never mutate historical content_json except for admin-level corrections. Specs can be regenerated; treat previous ones as historical snapshots. Builds can be superseded but not silently mutated (create a new row for a new preview URL to preserve history). Share links can be revoked or expired and should not be hard-deleted. Feedback items can change status and in_scope flags; decisions should be immutable once created, except for admin corrections. Audit events are append-only and may be periodically archived.

## Minimal Data Flow (happy path)

Client creates project → submits PRD v1 → internal generates MVP spec and build → internal creates share link → client opens review, submits feedback items → internal triages, optionally records decision and requests PRD v2 edits → server computes change log between v1 and v2 → repeat until approval.

## Optional Tables (future)

organizations (for multi-tenant), memberships (user↔org roles), attachments (Supabase Storage metadata for PRD source files), notifications (in-app/email), and task_items (if tasks must be queryable rows rather than JSON embedded in mvp_specs.tasks).

This schema covers everything your frontend already models (1:1), adds production-grade safeguards (RLS, indexes, audit), and cleanly supports the iterative PRD→spec→review→feedback→decision loop demanded by financial-services clients.