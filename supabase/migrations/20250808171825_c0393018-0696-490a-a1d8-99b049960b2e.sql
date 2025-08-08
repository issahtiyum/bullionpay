
-- Create the processed_webhooks table to store webhook processing history
CREATE TABLE public.processed_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins to view webhook processing history
CREATE POLICY "Admins can view processed webhooks" 
  ON public.processed_webhooks 
  FOR SELECT 
  USING (check_is_admin());

-- Create policy that allows the system to insert webhook records
CREATE POLICY "System can insert processed webhooks" 
  ON public.processed_webhooks 
  FOR INSERT 
  WITH CHECK (true);

-- Create index for efficient lookups
CREATE INDEX idx_processed_webhooks_webhook_id_event ON public.processed_webhooks(webhook_id, event_type);
CREATE INDEX idx_processed_webhooks_processed_at ON public.processed_webhooks(processed_at DESC);
