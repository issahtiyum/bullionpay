
-- Add a custom_fields column to the products table to store field configurations
ALTER TABLE public.products 
ADD COLUMN custom_fields JSONB DEFAULT '[]'::jsonb;

-- Add a custom_field_data column to the orders table to store user-submitted field data
ALTER TABLE public.orders 
ADD COLUMN custom_field_data JSONB DEFAULT '{}'::jsonb;

-- Add a comment to explain the structure
COMMENT ON COLUMN public.products.custom_fields IS 'Array of field configurations: [{"id": "netflix_email", "label": "Netflix Email", "type": "email", "required": true, "placeholder": "Enter your Netflix email"}]';
COMMENT ON COLUMN public.orders.custom_field_data IS 'Object containing user-submitted custom field data: {"netflix_email": "user@example.com", "netflix_password": "password123"}';
