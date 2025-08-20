# Product Requirements Document (PRD)
**Title:** Alltech SpecBridge — Client→MVP Portals (Frontend-first)  
**Version:** 1.0  
**Owner:** Shashank Vanga  
**Date:** August 1, 2025

## Change History
| Date (YYYY-MM-DD) | Author | Change Description |
|-------------------|--------|-------------------|
| 2025-08-18 | SV | Initial scope & dual-portal concept captured |

---

## Overview
Alltech SpecBridge is a dual-portal platform that turns client PRDs into MVP specs quickly and safely, with tight scope control and auditable iteration:

**Client Portal:** clients sign up, create projects, fill a guided PRD template, review share links, and submit feedback.

**Internal Portal:** PMs/Admins view all projects, generate MVP specs (mock AI for now), attach preview URLs, issue share links, triage feedback, and manage version diffs.

**Why now:** Financial services clients require fast discovery→prototype cycles, scope discipline, and compliance-friendly paper trails. SpecBridge compresses cycles while surfacing governance (decisions, impacts, contradictions) automatically.

**MVP constraints:** Frontend-only (Next.js + Zustand + localStorage). Clean seams for a future backend (Auth, DB, Storage, AI).

## Success Metrics

### Delivery
- **Time-to-first-spec (TTFS):** ≤ 24 hours from PRD v1 submission (using mock AI)
- **Review cycle time:** ≤ 3 business days from share link sent to client feedback received

### Quality & Scope
- **Spec approval rate within 2 iterations:** ≥ 90%
- **Contradictory feedback auto-flagging precision:** ≥ 80% heuristic accuracy (manual PM override allowed)
- **Scope adherence:** ≤ 10% of tasks marked out-of-scope post-approval

### Adoption
- **Client review participation rate:** ≥ 70% of projects use share links
- **Internal PM weekly active:** ≥ 80% of PMs use spec/diff/feedback flows

## Messaging
- **Tagline:** From PRD to MVP — fast, scoped, auditable.
- **For Clients:** "Submit once, see progress fast. Approve with clarity. No messy threads."
- **For PMs:** "Generate MVP specs in minutes, highlight changes and contradictions, keep scope tight."
- **For Enterprise/FS Buyers:** "Audit-ready workflow with version diffs and decision rationale baked in."

## Timeline / Release Planning

### MVP (Weeks 1–4)
Dual portals, mock auth, PRD editor, spec generation (mock AI), build link + share token, review page, feedback, diffs, decision/impact logging.

### Post-MVP (Weeks 5–8)
KPI dashboard, improved contradiction heuristics, CSV/PDF export, simple notifications.

### Scale (Quarter 2+)
Real backend (Auth, Postgres, Storage), AI provider integration, integrations (Jira, Slack), SSO, audit exports (SOC2 evidence-style), multi-tenant orgs.

## Personas
| Persona | Goals | Pain Points | Success Signals |
|---------|-------|-------------|-----------------|
| Client Reviewer (FS product owner) | Submit PRD, see a working MVP quickly, ensure scope alignment | Rework, unclear diffs, approval risk | Clear diffs, short cycles, one-link reviews |
| Internal PM | Convert PRD → MVP spec/tasks, manage scope & decisions, iterate | Manual redlining, scattered feedback | One-click spec gen, auto diffs, contradiction flags |
| Engineer | See precise MVP spec & tasks, understand changes | Vague specs, scope creep | Stable stories, tagged diffs, rationale |
| Admin | Oversight, reporting, governance | Lacking audit trail, unclear decisions | Decision/impact logs, KPIs, exports |

**Key Persona for MVP:** Internal PM (drives throughput, governs scope).

## Detailed User Scenarios (End-to-End Flows)

### Scenario A — Client Submits PRD v1
1. Client signs up / logs in → /client/projects → New Project.
2. Opens PRD Editor (tabbed guided template). Autosave shows status chip.
3. Clicks Submit v1 → system stores prdVersions[1] + normalized JSON.
4. Client overview shows "Spec in progress."

**Edge cases:**
- Missing critical sections → inline validation and save-as-draft.
- Attachments unsupported in MVP → instruct to paste content (future: file-to-text extraction).

**Acceptance:**
- Submit button disabled until required fields met.
- Version tag increments correctly; createdAt consistent.

### Scenario B — PM Generates MVP Spec & Creates Share Link
1. PM logs into Internal Portal → Projects → selects project.
2. Sees latest PRD v1, clicks Generate MVP Spec → mock AI outputs Markdown & tasks; saved as mvpSpecs linked to PRD v1.
3. PM enters Preview URL (e.g., Bolt/Lovable app) in Build tab.
4. Clicks Create Share Link → token generated → link copied.

**Acceptance:**
- Spec viewer renders markdown; tasks table shows P0/P1 and tags.
- Share link resolves on the same device; banner explains "MVP demo token".

### Scenario C — Client Reviews & Submits Feedback
1. Client opens /client/review/[token].
2. Sees preview, spec summary accordion, DiffPanel (if v2+ exists), FeedbackForm.
3. Submits "Enhancement" + text; immediate toast → stored.
4. Client may submit multiple feedback items; each appears in Internal triage.

**Acceptance:**
- Feedback persisted and visible in /internal/projects/[id]/feedback.
- Duplicate token → friendly error; revoked token → access denied message.

### Scenario D — PM Triage & Iterate (v2+)
1. PM opens Feedback tab → filters by category/status.
2. Toggles In-Scope or marks Contradiction (links to story IDs).
3. Makes small PRD edits → clicks Submit v2 (internal or client can do edits; for MVP, client edits only from client portal; PM can clone/edit in Internal PRD page if enabled).
4. System computes diff v2 vs v1, stores changeLogs, updates badges.
5. PM regenerates spec (if necessary), updates preview, and creates new share link.

**Acceptance:**
- Diff shows ADDED/REMOVED/MODIFIED granularity.
- Contradiction flags render warnings on related stories.
- Version rollups show clear history and decisions.

## Requirements by Area (with Acceptance Criteria)

### 1) Authentication & Role Routing (Mock)
**Req:** Client and Internal portals have separate sign-in experiences; session persisted in localStorage.

**AC:**
- Given I'm unauthenticated and visit /client/projects, I'm redirected to /client/auth/login.
- Given a client session, visiting /internal/* redirects to /internal/auth/login.

### 2) PRD Editor (Client)
**Req:** Tabbed PRD with autosave, submit versions.

**AC:**
- Submitting vN persists contentMd + normalized contentJson.
- Required fields enforced; autosave chip shows "Saved • 0:30s ago".

### 3) PRD Normalization
**Req:** Convert free-form fields to normalized JSON (sections + user_stories[]).

**AC:**
- Fields map to schema; invalid structures gracefully default to arrays/strings.

### 4) MVP Spec Generation (Mock AI)
**Req:** Button triggers generateSpec(normalizedPrd) → specMd, specJson, tasks[].

**AC:**
- Tasks map to story IDs; P0/P1 set; tags include feature/UX/compliance.

### 5) Diffing & Change Logs
**Req:** Compare vN to vN-1 and store delta.

**AC:**
- DiffPanel shows counts and badges; summary markdown available.

### 6) Build & Share Links
**Req:** Internal sets preview URL; create/revoke share token.

**AC:**
- Token resolves on same device; revoked token denies access.

### 7) Review Page & Feedback
**Req:** Public read-only review page; feedback form.

**AC:**
- Feedback saved and visible in Internal triage within the project.

### 8) Triage & Scope Guard
**Req:** Table to mark in-scope/out-of-scope, contradiction flags.

**AC:**
- Contradiction toggles show warning chips; export CSV (nice-to-have).

### 9) Governance: Decision Log & Impact Tracking
**Req:** Each accepted feedback and scope change records Decision Rationale + Impact.

**AC:**
- "Decision Rationale" textarea mandatory when marking out-of-scope or when flipping contradiction to accepted.
- Impact badge (timeline/effort/scope risk) visible on the project overview.

## Detailed Feature List (Prioritized)

### P0 (MVP)
- Dual portal navigation & mock auth
- Client PRD editor with versioning + normalization
- Internal spec generation (mock AI) + viewer (markdown + tasks)
- Preview URL + share token; public review page
- Feedback form; Internal triage with in-scope/contradiction toggles
- DiffPanel + change logs
- Decision Log & Impact fields

### P1 (Post-MVP)
- KPI chips: TTFS, open feedback, last version date
- Export (Markdown/PDF/CSV) for PRDs/specs/feedback
- Basic notifications (in-app toasts, later email)
- Improved contradiction NLP (negation, overlap thresholds)

### P2 (Scale)
- Backend APIs & DB (RLS), file uploads, SSO/SAML
- Jira/Slack/GitHub integrations
- Compliance exports (SOC2/PCI evidence packages)
- Multi-tenant orgs, role hierarchies

## "Features Out" (Explicitly Not in MVP)
- Real authentication/authorization backend
- File upload & OCR/text extraction
- Real AI vendor integration
- Multi-language UI
- Realtime collaboration cursors
- SLA automation / approvals workflow

## Designs (Guidelines)
- **Theme:** Dark, premium. Background #000000; primary gradient #8B5CF6 → #9333EA; secondary #6366F1.
- **Typography:** Inter for UI, JetBrains Mono for code/diffs.
- **Layout:** Left sidebar (Projects, PRD, Spec, Build, Feedback). Review page: simple, readable.
- **States:** Loading skeletons, toasts, accessible focus rings, WCAG AA contrast.
- **Badges:** Success (green), Warning/Contradiction (amber), Error/Out-of-Scope (red).

## Open Issues (to track)
- Should clients be able to directly edit v2+ PRDs or propose changes via feedback only?
- Who can close contradictions — PM only or PM+Admin?
- How long should share tokens remain valid in production (expiry & revocation policy)?
- Preview URL sandboxing policy (iframe vs external link) for FS security.

## Q&A (Key Decisions)
**Q:** Why dual portals instead of role toggles in one app?  
**A:** Clear separation simplifies auth, UX, and messaging; reduces accidental cross-access.

**Q:** Why store Decision Rationale & Impact?  
**A:** FS buyers need auditability and scope discipline; this reduces disputes and clarifies trade-offs.

**Q:** Why frontend-only MVP?  
**A:** Validate the workflow and UX fast; backend added once flows are stable.

## Other Considerations
- **Audit Trail:** Every version bump writes to change log + optional rationale.
- **Accessibility:** Keyboard nav for all forms/tables; alt text; color contrast.
- **Internationalization (future):** Copy centralization for easy i18n.

## Non-Functional Requirements (Targets)

### Performance:
- Time to interactive on modern laptop: < 2.5s dev-mode; < 1.5s prod build.
- Diff render: < 1s for 10k chars.

### Reliability:
- No crash on empty/malformed PRDs.
- Store hydration flag to avoid hydration mismatch.

### Security (Prod readiness plan):
- Future: tokenized links signed by server, expiring tokens, per-project scoping.
- Strict CSP for review if iframing previews.

### Observability (future backend):
- Logs for version changes, share link creation, feedback triage.
- Audit events with actor, timestamp, rationale.

## Epics → Features → User Stories (with Acceptance Criteria)

### Epic 1: Requirements Intake
**Feature:** Tabbed PRD Editor with Autosave & Submit  
**User Story (Client):**  
"As a client, I can complete a guided PRD and submit v1 so PMs can generate a spec."  
**AC:**
- Required fields gate Submit.
- Autosave every 10s; last-saved timestamp visible.
- On submit: v1 appears in history; overview shows "Spec in progress".

### Epic 2: Spec Generation & Viewing
**Feature:** Generate MVP Spec (Mock) & Show Markdown + Tasks  
**User Story (PM):**  
"As a PM, I can generate a spec from the latest PRD and see a prioritized task list."  
**AC:**
- Button disabled if no PRD exists.
- Spec saved with link to PRD version.
- Tasks render with P0/P1 chips.

### Epic 3: Diffs & Change Logs
**Feature:** Compute and render diffs when vN submitted  
**User Story (PM):**  
"As a PM, I can see what changed between PRD versions to manage scope."  
**AC:**
- ADDED/REMOVED/MODIFIED counts per section.
- Summary markdown accessible.
- Stored in changeLogs.

### Epic 4: Build & Share Review
**Feature:** Preview URL + Share Token  
**User Story (PM):**  
"As a PM, I can attach a preview and create a share link so clients can review."  
**AC:**
- Token open shows preview card + spec summary + DiffPanel.
- Revoked token denies access.

### Epic 5: Feedback & Triage
**Feature:** Review Page Feedback + Internal Triage  
**User Story (Client):**  
"As a client, I can leave structured feedback during review."  
**User Story (PM):**  
"As a PM, I can mark feedback in-scope or contradictory."  
**AC:**
- Feedback categories required; stored with token/project/build linkage.
- Triage table filters by category/status/inScope; contradiction toggle visible.

### Epic 6: Governance (Decision Rationale & Impact)
**Feature:** Decision Log with Rationale & Impact tags  
**User Story (PM):**  
"As a PM, I must record rationale & impact on scope changes so we have an audit trail."  
**AC:**
- When marking out-of-scope or accepting a contradictory item, rationale is required.
- Impact tags (timeline/effort/scope risk) selectable; appear as chips on overview.

## Roadmap (Detailed)

### MVP (Weeks 1–4)
- L0–L9 pipeline you already defined (frontend-only)
- Deliverables: dual portals, PRD editor, mock AI spec, diffs, feedback, share links, decision log

### Post-MVP (Weeks 5–8)
- KPI overview page (TTFS, open feedback, scope adherence)
- Export (Markdown/PDF/CSV)
- Inline comments on spec (lightweight), basic email notification hooks
- Better contradiction heuristics

### Quarter 2 (Scale)
- Real backend (Auth, Postgres, Storage, RLS)
- AI provider integration (model configurable)
- Integrations (Jira issues from tasks, Slack notifications)
- Admin orgs, projects billing metadata
- Compliance exports (SOC2/PCI styled)

## RACI (Key Decisions & Governance)
| Activity | PM | Admin | Engineer | Client |
|----------|-------|-------|----------|--------|
| Approve PRD version | R | A | C | R |
| Generate spec | R | A | C | I |
| Mark contradiction | R | A | C | I |
| Out-of-scope decision | R | A | C | C |
| Create share link | R | A | I | I |
| Accept final scope | A | C | C | R |

R = Responsible, A = Accountable, C = Consulted, I = Informed

## Risks & Mitigations
- **Infinite render loops / hydration mismatches (MVP):**  
  Use Zustand selectors, hydration flag, single-run redirects; client wrappers for dynamic routes.

- **Scope creep:**  
  Decision Rationale required on scope changes; DiffPanel front-and-center.

- **FS security posture:**  
  MVP is frontend-only; plan CSP, signed tokens, and RLS when back-end exists.

- **AI hallucinations (future):**  
  Keep human-in-the-loop; spec regeneration always diffed and rationalized.

## Glossary
- **PRD:** Product Requirements Document
- **MVP Spec:** Minimal viable product specification used to build prototype
- **DiffPanel:** UI that shows changes between PRD versions
- **Contradiction:** Feedback that negates previously accepted requirements
- **Decision Rationale / Impact:** Mandatory explanation and impact tags on critical scope decisions