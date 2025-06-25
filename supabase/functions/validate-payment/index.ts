
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { productId, amount, userId } = await req.json()

    // Validate product exists and get actual price
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('id, price, is_active')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!product.is_active) {
      return new Response(
        JSON.stringify({ error: 'Product is not active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate price matches
    if (parseFloat(amount) !== parseFloat(product.price)) {
      // Log potential price manipulation attempt
      await supabaseClient.rpc('log_audit_event', {
        p_action: 'PRICE_MANIPULATION_ATTEMPT',
        p_table_name: 'products',
        p_record_id: productId,
        p_new_values: { attempted_price: amount, actual_price: product.price, user_id: userId }
      })

      return new Response(
        JSON.stringify({ error: 'Price mismatch detected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ valid: true, product }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment validation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
