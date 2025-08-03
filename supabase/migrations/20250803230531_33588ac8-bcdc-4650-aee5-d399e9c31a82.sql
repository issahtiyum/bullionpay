
-- Phase 1: Critical Database Security Fixes

-- 1. Fix Function Search Paths - Add explicit search_path to prevent schema injection
CREATE OR REPLACE FUNCTION public.get_admin_role(user_id uuid DEFAULT auth.uid())
 RETURNS admin_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT role FROM public.admin_users 
  WHERE admin_users.user_id = $1 AND is_active = true
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.check_is_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = $1 AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.check_is_super_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = $1 AND role = 'super_admin' AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT public.check_is_admin($1);
$function$;

-- 2. Enhanced Admin Role Validation - Add stricter validation
CREATE OR REPLACE FUNCTION public.update_admin_role(target_admin_id uuid, new_role admin_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_user_role admin_role;
  target_current_role admin_role;
  target_user_id uuid;
  active_super_admins_count INTEGER;
BEGIN
  -- Validate input parameters
  IF target_admin_id IS NULL OR new_role IS NULL THEN
    RAISE EXCEPTION 'Invalid parameters provided';
  END IF;

  -- Check if current user is super admin
  SELECT role INTO current_user_role 
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can change roles';
  END IF;
  
  -- Get target admin's current role and user_id
  SELECT role, user_id INTO target_current_role, target_user_id
  FROM public.admin_users 
  WHERE id = target_admin_id AND is_active = true;
  
  -- Prevent self-demotion from super admin
  IF target_user_id = auth.uid() AND target_current_role = 'super_admin' AND new_role != 'super_admin' THEN
    RAISE EXCEPTION 'Cannot demote yourself from super admin';
  END IF;
  
  -- If demoting a super admin, ensure there will be at least one active super admin left
  IF target_current_role = 'super_admin' AND new_role != 'super_admin' THEN
    SELECT COUNT(*) INTO active_super_admins_count 
    FROM public.admin_users 
    WHERE role = 'super_admin' AND is_active = true AND id != target_admin_id;
    
    IF active_super_admins_count = 0 THEN
      RAISE EXCEPTION 'Cannot demote the last active super admin';
    END IF;
  END IF;
  
  -- Update the role with timestamp
  UPDATE public.admin_users 
  SET role = new_role, updated_at = now() 
  WHERE id = target_admin_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin user not found or inactive';
  END IF;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.remove_admin_user(target_admin_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_user_role admin_role;
  target_role admin_role;
  target_email TEXT;
  target_user_id uuid;
  active_super_admins_count INTEGER;
BEGIN
  -- Validate input
  IF target_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid admin ID provided';
  END IF;

  -- Check if current user is super admin
  SELECT role INTO current_user_role 
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can remove admins';
  END IF;
  
  -- Get target admin details
  SELECT role, email, user_id INTO target_role, target_email, target_user_id
  FROM public.admin_users 
  WHERE id = target_admin_id AND is_active = true;
  
  -- Prevent self-removal
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot remove yourself as admin';
  END IF;
  
  -- Prevent removal of the main super admin
  IF target_email = 'myharis.issah@gmail.com' THEN
    RAISE EXCEPTION 'Cannot remove the main super admin account';
  END IF;
  
  -- If removing a super admin, ensure there will be at least one active super admin left
  IF target_role = 'super_admin' THEN
    SELECT COUNT(*) INTO active_super_admins_count 
    FROM public.admin_users 
    WHERE role = 'super_admin' AND is_active = true AND id != target_admin_id;
    
    IF active_super_admins_count = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last active super admin';
    END IF;
  END IF;
  
  -- Remove the admin (soft delete by setting is_active to false)
  UPDATE public.admin_users 
  SET is_active = false, updated_at = now() 
  WHERE id = target_admin_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin user not found or already inactive';
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- 3. Enhanced User Account Deletion with Better Security
CREATE OR REPLACE FUNCTION public.hybrid_delete_user_account(target_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  deleted_user_uuid UUID := '00000000-0000-0000-0000-000000000000';
  current_user_id UUID := auth.uid();
  result JSON;
BEGIN
  -- Validate input
  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid user ID provided'
    );
  END IF;

  -- Only allow users to delete their own account or admins to delete any account
  IF current_user_id != target_user_id AND NOT public.check_is_admin(current_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized to delete this account'
    );
  END IF;

  -- Start transaction
  BEGIN
    -- 1. Anonymize orders (keep for business records)
    UPDATE public.orders 
    SET 
      user_id = deleted_user_uuid,
      delivery_info = CASE 
        WHEN delivery_info IS NOT NULL THEN '[REDACTED - User Deleted]'
        ELSE NULL
      END,
      custom_field_data = '{}'::jsonb
    WHERE user_id = target_user_id;
    
    -- 2. Anonymize transactions (keep for business records)
    UPDATE public.transactions 
    SET user_id = deleted_user_uuid
    WHERE user_id = target_user_id;
    
    -- 3. Anonymize disputes (keep for legal purposes)
    UPDATE public.disputes 
    SET 
      user_id = deleted_user_uuid,
      description = CASE 
        WHEN description IS NOT NULL THEN '[REDACTED - User Deleted]'
        ELSE NULL
      END
    WHERE user_id = target_user_id;
    
    -- 4. Delete profile (personal data)
    DELETE FROM public.profiles WHERE id = target_user_id;
    
    -- 5. Remove from admin_users if exists
    DELETE FROM public.admin_users WHERE user_id = target_user_id;
    
    result := json_build_object(
      'success', true,
      'message', 'Account successfully deleted with data anonymization'
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback on error
    RETURN json_build_object(
      'success', false,
      'error', 'Account deletion failed: ' || SQLERRM
    );
  END;
END;
$function$;

-- 4. Add audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (public.check_is_admin());

-- Create audit logging function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details);
EXCEPTION WHEN OTHERS THEN
  -- Log audit failures but don't break the main operation
  NULL;
END;
$function$;
