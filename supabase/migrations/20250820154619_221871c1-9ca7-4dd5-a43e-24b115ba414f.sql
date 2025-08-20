-- Create ENUMs
CREATE TYPE public.role_enum AS ENUM ('client', 'pm', 'admin');
CREATE TYPE public.feedback_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE public.feedback_category AS ENUM ('bug', 'enhancement', 'scope', 'question');
CREATE TYPE public.impact_tag AS ENUM ('timeline', 'effort', 'scope');

-- Create users table for profiles (linked to auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role public.role_enum NOT NULL DEFAULT 'client',
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_name TEXT,
  owner_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create PRD versions table
CREATE TABLE public.prd_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content_md TEXT,
  content_json JSONB,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, version)
);

-- Create MVP specs table
CREATE TABLE public.mvp_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  prd_version_id UUID NOT NULL REFERENCES public.prd_versions(id) ON DELETE CASCADE,
  spec_md TEXT,
  spec_json JSONB,
  tasks JSONB,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create builds table
CREATE TABLE public.builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  mvp_spec_id UUID REFERENCES public.mvp_specs(id) ON DELETE CASCADE,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create share links table
CREATE TABLE public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create feedback items table
CREATE TABLE public.feedback_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  share_link_id UUID REFERENCES public.share_links(id) ON DELETE CASCADE,
  build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
  author_email TEXT,
  role TEXT,
  category public.feedback_category NOT NULL,
  text TEXT NOT NULL,
  in_scope BOOLEAN,
  contradiction_of_ids JSONB,
  status public.feedback_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create change logs table
CREATE TABLE public.change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  from_prd_version INTEGER,
  to_prd_version INTEGER NOT NULL,
  delta_json JSONB,
  summary_md TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit events table
CREATE TABLE public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor UUID REFERENCES public.users(id),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create decisions table
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_type TEXT,
  source_id TEXT,
  rationale TEXT NOT NULL,
  impact JSONB,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_projects_owner ON public.projects(owner_user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);
CREATE INDEX idx_projects_updated_at ON public.projects(updated_at);
CREATE INDEX idx_prd_versions_project ON public.prd_versions(project_id);
CREATE INDEX idx_mvp_specs_project ON public.mvp_specs(project_id);
CREATE INDEX idx_builds_project ON public.builds(project_id);
CREATE INDEX idx_feedback_status ON public.feedback_items(status);
CREATE INDEX idx_feedback_category ON public.feedback_items(category);
CREATE INDEX idx_audit_events_project ON public.audit_events(project_id);
CREATE INDEX idx_audit_events_created_at ON public.audit_events(created_at);

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

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.role_enum
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for projects table
CREATE POLICY "Clients can view their own projects" ON public.projects
  FOR SELECT USING (
    owner_user_id = auth.uid() OR 
    public.get_user_role(auth.uid()) IN ('pm', 'admin')
  );

CREATE POLICY "Clients can create their own projects" ON public.projects
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "PMs and Admins can create projects" ON public.projects
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

CREATE POLICY "Project owners can update their projects" ON public.projects
  FOR UPDATE USING (
    owner_user_id = auth.uid() OR 
    public.get_user_role(auth.uid()) IN ('pm', 'admin')
  );

-- RLS Policies for prd_versions table
CREATE POLICY "Users can view PRDs for accessible projects" ON public.prd_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND (
        p.owner_user_id = auth.uid() OR 
        public.get_user_role(auth.uid()) IN ('pm', 'admin')
      )
    )
  );

CREATE POLICY "Users can create PRDs for accessible projects" ON public.prd_versions
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND (
        p.owner_user_id = auth.uid() OR 
        public.get_user_role(auth.uid()) IN ('pm', 'admin')
      )
    )
  );

-- RLS Policies for mvp_specs table
CREATE POLICY "Users can view specs for accessible projects" ON public.mvp_specs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND (
        p.owner_user_id = auth.uid() OR 
        public.get_user_role(auth.uid()) IN ('pm', 'admin')
      )
    )
  );

CREATE POLICY "PMs and Admins can create specs" ON public.mvp_specs
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

-- RLS Policies for builds table
CREATE POLICY "Users can view builds for accessible projects" ON public.builds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND (
        p.owner_user_id = auth.uid() OR 
        public.get_user_role(auth.uid()) IN ('pm', 'admin')
      )
    )
  );

CREATE POLICY "PMs and Admins can create builds" ON public.builds
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

-- RLS Policies for feedback_items table
CREATE POLICY "Users can view feedback for accessible projects" ON public.feedback_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND (
        p.owner_user_id = auth.uid() OR 
        public.get_user_role(auth.uid()) IN ('pm', 'admin')
      )
    )
  );

-- Note: Feedback creation via share links will be handled by server-side functions

-- RLS Policies for change_logs table
CREATE POLICY "Users can view change logs for accessible projects" ON public.change_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND (
        p.owner_user_id = auth.uid() OR 
        public.get_user_role(auth.uid()) IN ('pm', 'admin')
      )
    )
  );

-- RLS Policies for audit_events table
CREATE POLICY "Admins can view all audit events" ON public.audit_events
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "PMs can view project audit events" ON public.audit_events
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('pm', 'admin') AND
    (project_id IS NULL OR EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id
    ))
  );

-- RLS Policies for decisions table
CREATE POLICY "Users can view decisions for accessible projects" ON public.decisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND (
        p.owner_user_id = auth.uid() OR 
        public.get_user_role(auth.uid()) IN ('pm', 'admin')
      )
    )
  );

CREATE POLICY "PMs and Admins can create decisions" ON public.decisions
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    public.get_user_role(auth.uid()) IN ('pm', 'admin')
  );

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for projects table
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.role_enum, 'client')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();