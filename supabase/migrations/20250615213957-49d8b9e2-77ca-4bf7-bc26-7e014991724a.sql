
-- Update the super admin email address
UPDATE public.admin_users 
SET email = 'myissah.haris@gmail.com'
WHERE email = 'myharis.issah@gmail.com';

-- Also update the initial super admin insert logic for future reference
-- First, try to insert for the new email if a user exists with that email
INSERT INTO public.admin_users (user_id, email, role, created_by)
SELECT 
  au.id,
  'myissah.haris@gmail.com',
  'super_admin'::admin_role,
  au.id
FROM auth.users au 
WHERE au.email = 'myissah.haris@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin'::admin_role,
  is_active = true;
