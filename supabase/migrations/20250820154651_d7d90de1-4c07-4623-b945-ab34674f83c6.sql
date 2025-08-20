-- Fix RLS policies - add missing INSERT policies for share_links table
CREATE POLICY "Service role can insert share links" ON public.share_links
  FOR ALL USING (auth.role() = 'service_role');

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.role_enum
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

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