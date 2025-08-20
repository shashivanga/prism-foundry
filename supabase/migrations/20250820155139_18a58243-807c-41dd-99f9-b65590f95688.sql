-- Update database schema to match db-design.md specifications exactly

-- First, drop existing tables that need restructuring (cascade will handle references)
DROP TABLE IF EXISTS public.decisions CASCADE;
DROP TABLE IF EXISTS public.audit_events CASCADE;
DROP TABLE IF EXISTS public.change_logs CASCADE;
DROP TABLE IF EXISTS public.feedback_items CASCADE;
DROP TABLE IF EXISTS public.share_links CASCADE;
DROP TABLE IF EXISTS public.builds CASCADE;
DROP TABLE IF EXISTS public.mvp_specs CASCADE;
DROP TABLE IF EXISTS public.prd_versions CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing types to recreate with exact specifications
DROP TYPE IF EXISTS public.role_enum CASCADE;
DROP TYPE IF EXISTS public.feedback_status CASCADE;
DROP TYPE IF EXISTS public.feedback_category CASCADE;
DROP TYPE IF EXISTS public.impact_tag CASCADE;

-- Create enum types exactly as specified
CREATE TYPE public.role_enum AS ENUM ('client', 'pm', 'admin');
CREATE TYPE public.feedback_category AS ENUM ('bug', 'enhancement', 'scope', 'question');
CREATE TYPE public.feedback_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE public.impact_tag AS ENUM ('timeline', 'effort', 'scope');

-- 1) Users table - Master record for authenticated persons
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role public.role_enum NOT NULL DEFAULT 'client',
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link to auth.users for Supabase integration
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2) Projects table - Central business container
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) PRD Versions table - Immutable history of PRD submissions
CREATE TABLE public.prd_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content_md TEXT NOT NULL,
  content_json JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_project_version UNIQUE(project_id, version)
);

-- 4) MVP Specs table - Generated specifications per PRD version
CREATE TABLE public.mvp_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  prd_version_id UUID NOT NULL REFERENCES public.prd_versions(id) ON DELETE CASCADE,
  spec_md TEXT NOT NULL,
  spec_json JSONB NOT NULL,
  tasks JSONB, -- Array of {story_id, title, priority, tags}
  model TEXT, -- Which AI/model produced it
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5) Builds table - Links project/spec to Preview URL
CREATE TABLE public.builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  mvp_spec_id UUID REFERENCES public.mvp_specs(id) ON DELETE CASCADE,
  preview_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6) Share Links table - Tokenized review links
CREATE TABLE public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7) Feedback Items table - Review feedback with categorization
CREATE TABLE public.feedback_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  share_link_id UUID REFERENCES public.share_links(id) ON DELETE CASCADE,
  build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
  author_email TEXT,
  role TEXT, -- 'client', 'internal', 'external'
  category public.feedback_category NOT NULL,
  text TEXT NOT NULL,
  in_scope BOOLEAN,
  contradiction_of_ids JSONB, -- Array of related story IDs
  status public.feedback_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8) Change Logs table - Immutable diff records between PRD versions
CREATE TABLE public.change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  from_prd_version INTEGER,
  to_prd_version INTEGER NOT NULL,
  delta_json JSONB, -- Structured diff
  summary_md TEXT, -- Human summary
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9) Audit Events table - System-level action trail
CREATE TABLE public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor UUID REFERENCES public.users(id), -- nullable for public/token actions
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE, -- nullable for global events
  type TEXT NOT NULL, -- 'PRD_SUBMITTED', 'SPEC_GENERATED', etc.
  payload JSONB, -- Details and previous/new states
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10) Decisions table - Explicit scope decisions with rationale
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_type TEXT, -- 'feedback', 'change', 'manual'
  source_id TEXT, -- Originating item ID (soft link)
  rationale TEXT NOT NULL,
  impact JSONB, -- Array like ['timeline', 'effort']
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comprehensive indexes for performance
-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Projects indexes
CREATE INDEX idx_projects_owner ON public.projects(owner_user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);
CREATE INDEX idx_projects_updated_at ON public.projects(updated_at);

-- PRD Versions indexes
CREATE INDEX idx_prd_versions_project_created ON public.prd_versions(project_id, created_at);
CREATE INDEX idx_prd_versions_project_version ON public.prd_versions(project_id, version);

-- MVP Specs indexes
CREATE INDEX idx_mvp_specs_project_created ON public.mvp_specs(project_id, created_at);
CREATE INDEX idx_mvp_specs_prd_version ON public.mvp_specs(prd_version_id);

-- Builds indexes
CREATE INDEX idx_builds_project_created ON public.builds(project_id, created_at);
CREATE INDEX idx_builds_mvp_spec ON public.builds(mvp_spec_id);

-- Share Links indexes (token already unique)
CREATE INDEX idx_share_links_project_created ON public.share_links(project_id, created_at);
CREATE INDEX idx_share_links_build ON public.share_links(build_id);
CREATE INDEX idx_share_links_revoked ON public.share_links(is_revoked) WHERE is_revoked = TRUE;
CREATE INDEX idx_share_links_expires ON public.share_links(expires_at) WHERE expires_at IS NOT NULL;

-- Feedback Items indexes
CREATE INDEX idx_feedback_project_created ON public.feedback_items(project_id, created_at);
CREATE INDEX idx_feedback_build ON public.feedback_items(build_id);
CREATE INDEX idx_feedback_status ON public.feedback_items(status);
CREATE INDEX idx_feedback_category ON public.feedback_items(category);

-- Change Logs indexes
CREATE INDEX idx_change_logs_project_created ON public.change_logs(project_id, created_at);
CREATE INDEX idx_change_logs_project_to_version ON public.change_logs(project_id, to_prd_version);

-- Audit Events indexes
CREATE INDEX idx_audit_events_project_created ON public.audit_events(project_id, created_at);
CREATE INDEX idx_audit_events_type_created ON public.audit_events(type, created_at);

-- Decisions indexes
CREATE INDEX idx_decisions_project_created ON public.decisions(project_id, created_at);
CREATE INDEX idx_decisions_source ON public.decisions(source_type, source_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prd_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvp_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;