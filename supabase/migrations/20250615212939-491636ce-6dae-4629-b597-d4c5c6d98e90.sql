
-- Create admin roles enum
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'moderator');

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'admin',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Admin users can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
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

-- Create function to get admin role
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

-- Insert initial super admin (you)
INSERT INTO public.admin_users (user_id, email, role, created_by)
SELECT 
  au.id,
  'myharis.issah@gmail.com',
  'super_admin'::admin_role,
  au.id
FROM auth.users au 
WHERE au.email = 'myharis.issah@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin'::admin_role,
  is_active = true;

-- Update orders table policies to allow admin access
CREATE POLICY "Admins can view all orders" 
  ON public.orders 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update orders" 
  ON public.orders 
  FOR UPDATE 
  TO authenticated
  USING (public.is_admin());

-- Update transactions table policies for admin access
CREATE POLICY "Admins can view all transactions" 
  ON public.transactions 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin());

-- Create disputes table
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'rejected')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Disputes policies
CREATE POLICY "Users can view their own disputes" 
  ON public.disputes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create disputes" 
  ON public.disputes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all disputes" 
  ON public.disputes 
  FOR ALL 
  TO authenticated
  USING (public.is_admin());
