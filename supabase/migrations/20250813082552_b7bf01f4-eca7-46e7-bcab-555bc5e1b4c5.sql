
-- Add is_test column to orders table to track test vs live orders
ALTER TABLE public.orders 
ADD COLUMN is_test BOOLEAN DEFAULT false;

-- Add an index for better performance when filtering by test/live orders
CREATE INDEX idx_orders_is_test ON public.orders(is_test);

-- Update existing orders based on transaction references
-- Orders with ps_test_ references are test orders
UPDATE public.orders 
SET is_test = true 
WHERE id IN (
  SELECT o.id 
  FROM public.orders o
  JOIN public.transactions t ON o.transaction_id = t.id
  WHERE t.reference LIKE 'ps_test_%'
);

-- Orders with ps_live_ references are live orders (already false by default)
UPDATE public.orders 
SET is_test = false 
WHERE id IN (
  SELECT o.id 
  FROM public.orders o
  JOIN public.transactions t ON o.transaction_id = t.id
  WHERE t.reference LIKE 'ps_live_%'
);
