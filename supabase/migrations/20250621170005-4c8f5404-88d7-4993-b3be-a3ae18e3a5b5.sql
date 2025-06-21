
-- Add a function to safely update admin roles
CREATE OR REPLACE FUNCTION public.update_admin_role(
  target_admin_id UUID,
  new_role admin_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role admin_role;
  target_current_role admin_role;
  active_super_admins_count INTEGER;
BEGIN
  -- Check if current user is super admin
  SELECT role INTO current_user_role 
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can change roles';
  END IF;
  
  -- Get target admin's current role
  SELECT role INTO target_current_role 
  FROM public.admin_users 
  WHERE id = target_admin_id AND is_active = true;
  
  -- If demoting a super admin, ensure there will be at least one active super admin left
  IF target_current_role = 'super_admin' AND new_role != 'super_admin' THEN
    SELECT COUNT(*) INTO active_super_admins_count 
    FROM public.admin_users 
    WHERE role = 'super_admin' AND is_active = true AND id != target_admin_id;
    
    IF active_super_admins_count = 0 THEN
      RAISE EXCEPTION 'Cannot demote the last active super admin';
    END IF;
  END IF;
  
  -- Update the role
  UPDATE public.admin_users 
  SET role = new_role, updated_at = now() 
  WHERE id = target_admin_id;
  
  RETURN TRUE;
END;
$$;

-- Add a function to safely remove admins
CREATE OR REPLACE FUNCTION public.remove_admin_user(target_admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role admin_role;
  target_role admin_role;
  target_email TEXT;
  active_super_admins_count INTEGER;
BEGIN
  -- Check if current user is super admin
  SELECT role INTO current_user_role 
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can remove admins';
  END IF;
  
  -- Get target admin details
  SELECT role, email INTO target_role, target_email 
  FROM public.admin_users 
  WHERE id = target_admin_id AND is_active = true;
  
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
  WHERE id = target_admin_id;
  
  RETURN TRUE;
END;
$$;
