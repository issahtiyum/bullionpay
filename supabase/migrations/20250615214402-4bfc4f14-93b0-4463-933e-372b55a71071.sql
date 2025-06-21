
-- Drop the existing problematic RLS policies on admin_users
DROP POLICY IF EXISTS "Admin users can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;

-- Create a security definer function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = $1 AND is_active = true
  );
$$;

-- Create a security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.check_is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = $1 AND role = 'super_admin' AND is_active = true
  );
$$;

-- Create a security definer function to get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(user_id UUID DEFAULT auth.uid())
RETURNS admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.admin_users 
  WHERE admin_users.user_id = $1 AND is_active = true
  LIMIT 1;
$$;

-- Recreate the RLS policies using the security definer functions
CREATE POLICY "Admin users can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (public.check_is_admin());

CREATE POLICY "Super admins can manage admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (public.check_is_super_admin());

-- Update the existing is_admin function to use the new security definer approach
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.check_is_admin($1);
$$;
