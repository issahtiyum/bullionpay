-- Add test_mode_override column to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN test_mode_override boolean DEFAULT false NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.admin_users.test_mode_override IS 'When true, this admin will use TEST mode for payments while others use the global mode';