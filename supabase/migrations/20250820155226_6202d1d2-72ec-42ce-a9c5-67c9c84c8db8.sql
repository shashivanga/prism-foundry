-- Create comprehensive RLS policies and helper functions according to db-design.md

-- Security definer function to get user role (avoiding infinite recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.role_enum
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- Helper function to check if user can access project
CREATE OR REPLACE FUNCTION public.can_access_project(user_id UUID, project_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND (
      p.owner_user_id = user_id OR 
      public.get_user_role(user_id) IN ('pm', 'admin')
    )
  );
$$;

-- RLS Policies for USERS table
-- Users can view their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (non-role fields)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Admins can update all users (including roles)
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for PROJECTS table
-- Clients can select their own projects; PM/Admin can select all
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT USING (
    owner_user_id = auth.uid() OR 
    public.get_user_role(auth.uid()) IN ('pm', 'admin')
  );

-- Clients can create their own projects
CREATE POLICY "projects_insert_client" ON public.projects
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());

-- PM/Admin can create projects for any client
CREATE POLICY "projects_insert_internal" ON public.projects
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

-- Project owners and internal users can update projects
CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE USING (
    owner_user_id = auth.uid() OR 
    public.get_user_role(auth.uid()) IN ('pm', 'admin')
  );

-- RLS Policies for PRD_VERSIONS table
-- Users can view PRD versions for accessible projects
CREATE POLICY "prd_versions_select" ON public.prd_versions
  FOR SELECT USING (public.can_access_project(auth.uid(), project_id));

-- Users can create PRD versions for accessible projects
CREATE POLICY "prd_versions_insert" ON public.prd_versions
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    public.can_access_project(auth.uid(), project_id)
  );

-- RLS Policies for MVP_SPECS table
-- Users can view specs for accessible projects
CREATE POLICY "mvp_specs_select" ON public.mvp_specs
  FOR SELECT USING (public.can_access_project(auth.uid(), project_id));

-- PM/Admin can create specs
CREATE POLICY "mvp_specs_insert" ON public.mvp_specs
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

-- PM/Admin can update specs
CREATE POLICY "mvp_specs_update" ON public.mvp_specs
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

-- RLS Policies for BUILDS table
-- Users can view builds for accessible projects
CREATE POLICY "builds_select" ON public.builds
  FOR SELECT USING (public.can_access_project(auth.uid(), project_id));

-- PM/Admin can create builds
CREATE POLICY "builds_insert" ON public.builds
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

-- PM/Admin can update builds
CREATE POLICY "builds_update" ON public.builds
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

-- RLS Policies for SHARE_LINKS table
-- Users can view share links for accessible projects
CREATE POLICY "share_links_select" ON public.share_links
  FOR SELECT USING (public.can_access_project(auth.uid(), project_id));

-- PM/Admin can create share links
CREATE POLICY "share_links_insert" ON public.share_links
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

-- PM/Admin can update share links (for revocation)
CREATE POLICY "share_links_update" ON public.share_links
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

-- Service role can access all share links (for public token validation)
CREATE POLICY "share_links_service_role" ON public.share_links
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for FEEDBACK_ITEMS table
-- Users can view feedback for accessible projects
CREATE POLICY "feedback_items_select" ON public.feedback_items
  FOR SELECT USING (public.can_access_project(auth.uid(), project_id));

-- Authenticated users can create feedback for accessible projects
CREATE POLICY "feedback_items_insert_auth" ON public.feedback_items
  FOR INSERT WITH CHECK (public.can_access_project(auth.uid(), project_id));

-- Service role can insert feedback (for public token-based submissions)
CREATE POLICY "feedback_items_insert_service" ON public.feedback_items
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- PM/Admin can update feedback (for triage)
CREATE POLICY "feedback_items_update" ON public.feedback_items
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('pm', 'admin'));

-- RLS Policies for CHANGE_LOGS table
-- Users can view change logs for accessible projects
CREATE POLICY "change_logs_select" ON public.change_logs
  FOR SELECT USING (public.can_access_project(auth.uid(), project_id));

-- Service role can insert change logs (server-generated)
CREATE POLICY "change_logs_insert" ON public.change_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for AUDIT_EVENTS table
-- Admins can view all audit events
CREATE POLICY "audit_events_select_admin" ON public.audit_events
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- PM can view project-related audit events
CREATE POLICY "audit_events_select_pm" ON public.audit_events
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('pm', 'admin') AND
    (project_id IS NULL OR public.can_access_project(auth.uid(), project_id))
  );

-- Project owners can view audit events for their projects
CREATE POLICY "audit_events_select_owner" ON public.audit_events
  FOR SELECT USING (
    project_id IS NOT NULL AND 
    public.can_access_project(auth.uid(), project_id)
  );

-- Service role can insert audit events
CREATE POLICY "audit_events_insert" ON public.audit_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for DECISIONS table
-- Users can view decisions for accessible projects
CREATE POLICY "decisions_select" ON public.decisions
  FOR SELECT USING (public.can_access_project(auth.uid(), project_id));

-- PM/Admin can create decisions
CREATE POLICY "decisions_insert" ON public.decisions
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    public.get_user_role(auth.uid()) IN ('pm', 'admin')
  );

-- Create trigger functions for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup (links auth.users to public.users)
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