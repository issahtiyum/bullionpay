
-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN email TEXT UNIQUE;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email
  );
  RETURN new;
END;
$$;

-- Update existing profiles with email from auth.users (for existing users)
UPDATE public.profiles 
SET email = au.email 
FROM auth.users au 
WHERE profiles.id = au.id AND profiles.email IS NULL;
