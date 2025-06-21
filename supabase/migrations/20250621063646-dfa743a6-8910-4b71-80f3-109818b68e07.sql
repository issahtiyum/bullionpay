
-- Add attended field to orders table to track if order has been addressed by admin
ALTER TABLE public.orders 
ADD COLUMN attended BOOLEAN NOT NULL DEFAULT false;

-- Add comment to explain the field
COMMENT ON COLUMN public.orders.attended IS 'Indicates whether the order has been attended to by admin staff';
