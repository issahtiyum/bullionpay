
-- 1) Create a tiny config table to hold the active Paystack mode
CREATE TABLE IF NOT EXISTS public.payment_config (
  id TEXT PRIMARY KEY,
  active_mode TEXT NOT NULL DEFAULT 'live' CHECK (active_mode IN ('live','test')),
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Enable RLS
ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;

-- 3) RLS policies
-- Allow admins to read the current config
CREATE POLICY "Admins can view payment config"
  ON public.payment_config
  FOR SELECT
  USING (check_is_admin());

-- Restrict writes to super admins
CREATE POLICY "Super admins can modify payment config"
  ON public.payment_config
  FOR INSERT
  WITH CHECK (check_is_super_admin());

CREATE POLICY "Super admins can update payment config"
  ON public.payment_config
  FOR UPDATE
  USING (check_is_super_admin());

-- 4) Seed a default row if it doesn't exist
INSERT INTO public.payment_config (id, active_mode)
VALUES ('paystack', 'live')
ON CONFLICT (id) DO NOTHING;
