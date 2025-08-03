
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PaymentVerificationRequest {
  reference: string;
  user_id?: string;
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
    };
    authorization: any;
    plan: any;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get and validate authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Parse and validate request body
    const { reference, user_id }: PaymentVerificationRequest = await req.json()
    
    if (!reference || typeof reference !== 'string' || reference.length > 100) {
      throw new Error('Invalid payment reference')
    }

    // Security check: ensure user can only verify their own payments or is admin
    const { data: adminCheck } = await supabaseClient
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    const isAdmin = adminCheck?.role === 'admin' || adminCheck?.role === 'super_admin'
    const targetUserId = user_id || user.id

    if (!isAdmin && targetUserId !== user.id) {
      throw new Error('Unauthorized: Can only verify own payments')
    }

    // Check if transaction already exists and belongs to the authenticated user
    const { data: existingTransaction } = await supabaseClient
      .from('transactions')
      .select('id, user_id, status')
      .eq('reference', reference)
      .single()

    if (existingTransaction && existingTransaction.user_id !== targetUserId && !isAdmin) {
      throw new Error('Unauthorized: Transaction belongs to different user')
    }

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured')
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text()
      console.error('Paystack API error:', errorText)
      throw new Error('Payment verification failed')
    }

    const paystackData: PaystackVerifyResponse = await paystackResponse.json()

    if (!paystackData.status) {
      throw new Error('Payment verification unsuccessful')
    }

    // Log audit event
    await supabaseClient.rpc('log_audit_event', {
      p_action: 'PAYMENT_VERIFICATION',
      p_resource_type: 'transaction',
      p_resource_id: reference,
      p_details: {
        paystack_status: paystackData.data.status,
        amount: paystackData.data.amount,
        currency: paystackData.data.currency
      }
    })

    // Return sanitized response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reference: paystackData.data.reference,
          status: paystackData.data.status,
          amount: paystackData.data.amount,
          currency: paystackData.data.currency,
          paid_at: paystackData.data.paid_at,
          customer_email: paystackData.data.customer.email,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    
    // Return generic error message to prevent information disclosure
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Payment verification failed. Please try again or contact support.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
