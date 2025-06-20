
-- Create an enum for product categories
CREATE TYPE public.product_category AS ENUM ('Subscription', 'Gift Card', 'Game Credit');

-- Create the products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category product_category NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.admin_users(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active products (for customers browsing the store)
CREATE POLICY "Anyone can view active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

-- Allow admins to view all products (including inactive ones)
CREATE POLICY "Admins can view all products" 
  ON public.products 
  FOR SELECT 
  USING (public.check_is_admin());

-- Allow admins and super admins to insert products
CREATE POLICY "Admins can create products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (public.check_is_admin());

-- Allow admins and super admins to update products
CREATE POLICY "Admins can update products" 
  ON public.products 
  FOR UPDATE 
  USING (public.check_is_admin());

-- Allow super admins to delete products
CREATE POLICY "Super admins can delete products" 
  ON public.products 
  FOR DELETE 
  USING (public.check_is_super_admin());

-- Insert sample products to replace the hardcoded ones
INSERT INTO public.products (name, category, price, image, description) VALUES
('Netflix Basic', 'Subscription', 50.00, '/placeholder.svg', '1 month subscription plan with full access to all features.'),
('Amazon Gift Card', 'Gift Card', 100.00, '/placeholder.svg', 'Digital gift card with full value that can be redeemed immediately.'),
('Xbox Game Pass', 'Game Credit', 75.00, '/placeholder.svg', 'Game credits that can be used for in-game purchases or subscriptions.'),
('Spotify Premium', 'Subscription', 30.00, '/placeholder.svg', '1 month subscription plan with full access to all features.'),
('Steam Wallet', 'Game Credit', 150.00, '/placeholder.svg', 'Game credits that can be used for in-game purchases or subscriptions.'),
('iTunes Gift Card', 'Gift Card', 80.00, '/placeholder.svg', 'Digital gift card with full value that can be redeemed immediately.');
