
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
};

type Mode = 'live' | 'test';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return new Response(JSON.stringify({ error: 'Invalid authentication' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Check that user is super_admin
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    const isSuperAdmin = adminCheck?.role === 'super_admin'
    if (!isSuperAdmin) {
      return new Response(JSON.stringify({ error: 'Only super admins can change payment mode' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({}))
    const mode: Mode = body.mode
    if (mode !== 'live' && mode !== 'test') {
      return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Upsert the config row
    const { error: upsertError } = await supabase
      .from('payment_config')
      .upsert({
        id: 'paystack',
        active_mode: mode,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (upsertError) {
      console.error('Failed to update payment_config:', upsertError)
      return new Response(JSON.stringify({ error: 'Failed to update mode' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    await supabase.rpc('log_audit_event', {
      p_action: `PAYSTACK_MODE_SET_${mode.toUpperCase()}`,
      p_resource_type: 'payment_config',
      p_resource_id: 'paystack',
      p_details: { updated_by: user.id, mode }
    })

    return new Response(JSON.stringify({ success: true, mode }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('admin-set-paystack-mode error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})
