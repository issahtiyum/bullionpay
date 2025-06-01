
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { reference, user_id } = await req.json()

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Payment reference is required' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const { data } = paystackData
    
    // Update transaction in database
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        status: data.status === 'success' ? 'success' : 'failed',
        paystack_reference: data.reference,
        payment_method: data.channel,
        updated_at: new Date().toISOString(),
      })
      .eq('reference', reference)
      .eq('user_id', user_id)

    if (transactionError) {
      console.error('Transaction update error:', transactionError)
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // If payment successful, update order status
    if (data.status === 'success') {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('transaction_id', (await supabase
          .from('transactions')
          .select('id')
          .eq('reference', reference)
          .single()
        ).data?.id)

      if (orderError) {
        console.error('Order update error:', orderError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: data.status,
        reference: data.reference,
        amount: data.amount / 100, // Paystack amounts are in kobo
      }),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})
