
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

    console.log('Verification request:', { reference, user_id })

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
    console.log('Paystack verification response:', paystackData)

    if (!paystackData.status) {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed', details: paystackData.message }),
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
        JSON.stringify({ error: 'Failed to update transaction', details: transactionError.message }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('Transaction updated successfully')

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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})
