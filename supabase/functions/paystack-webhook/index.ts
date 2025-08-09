
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PaystackWebhookEvent {
  event: string;
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get webhook signature
    const signature = req.headers.get('x-paystack-signature')
    if (!signature) {
      console.error('Missing Paystack signature')
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Get request body
    const body = await req.text()

    const testSecret = Deno.env.get('PAYSTACK_SECRET_KEY_TEST') || ''
    const liveSecret = Deno.env.get('PAYSTACK_SECRET_KEY_LIVE') || Deno.env.get('PAYSTACK_SECRET_KEY') || ''

    // Verify webhook signature against TEST then LIVE secrets
    const testHash = testSecret ? createHmac('sha512', testSecret).update(body).digest('hex') : null
    const liveHash = liveSecret ? createHmac('sha512', liveSecret).update(body).digest('hex') : null

    if (testHash !== signature && liveHash !== signature) {
      console.error('Invalid webhook signature')
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const event: PaystackWebhookEvent = JSON.parse(body)
    console.log('Received webhook event:', event.event)

    // Check for idempotency - prevent duplicate processing
    const webhookId = event.data.id || event.data.reference
    const { data: existingWebhook } = await supabase
      .from('processed_webhooks')
      .select('id')
      .eq('webhook_id', webhookId)
      .eq('event_type', event.event)
      .single()

    if (existingWebhook) {
      console.log('Webhook already processed:', webhookId)
      return new Response('Already processed', { status: 200, headers: corsHeaders })
    }

    // Route event to appropriate handler
    let result;
    switch (event.event) {
      case 'charge.success':
        result = await handleChargeSuccess(supabase, event.data)
        break
      case 'charge.failed':
        result = await handleChargeFailed(supabase, event.data)
        break
      case 'refund.processed':
        result = await handleRefundProcessed(supabase, event.data)
        break
      case 'transfer.success':
      case 'transfer.failed':
        result = await handleTransferEvent(supabase, event.data, event.event)
        break
      case 'dispute.create':
        result = await handleDisputeCreate(supabase, event.data)
        break
      case 'dispute.resolve':
        result = await handleDisputeResolve(supabase, event.data)
        break
      case 'customeridentification.success':
      case 'customeridentification.failed':
        result = await handleCustomerIdentification(supabase, event.data, event.event)
        break
      default:
        console.log('Unhandled webhook event:', event.event)
        result = { success: true, message: 'Event logged but not processed' }
    }

    // Mark webhook as processed
    await supabase
      .from('processed_webhooks')
      .insert({
        webhook_id: webhookId,
        event_type: event.event,
        processed_at: new Date().toISOString(),
        success: result.success
      })

    // Log the webhook event for audit purposes
    await supabase.rpc('log_audit_event', {
      p_action: `WEBHOOK_${event.event.toUpperCase()}`,
      p_resource_type: 'webhook',
      p_resource_id: webhookId,
      p_details: {
        event_type: event.event,
        success: result.success,
        message: result.message
      }
    })

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleChargeSuccess(supabase: any, data: any) {
  try {
    const reference = data.reference
    console.log('Processing successful charge:', reference)

    // Lookup transaction by reference to get its UUID id
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .single()

    if (txError || !transaction) {
      console.error('Transaction not found for reference:', reference, txError)
      return { success: false, message: 'Transaction not found' }
    }

    // Update transaction status
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        status: 'success',
        paystack_reference: data.reference,
        payment_method: data.channel,
        updated_at: new Date().toISOString(),
      })
      .eq('reference', reference)

    if (transactionError) {
      console.error('Error updating transaction:', transactionError)
      return { success: false, message: 'Failed to update transaction' }
    }

    // Update related order status using transaction UUID
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transaction.id)

    if (orderError) {
      console.error('Error updating order:', orderError)
      return { success: false, message: 'Failed to update order' }
    }

    return { success: true, message: 'Charge success processed' }
  } catch (error) {
    console.error('Error in handleChargeSuccess:', error)
    return { success: false, message: 'Processing error' }
  }
}

async function handleChargeFailed(supabase: any, data: any) {
  try {
    const reference = data.reference
    console.log('Processing failed charge:', reference)

    // Lookup transaction by reference to get its UUID id
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .single()

    if (txError || !transaction) {
      console.error('Transaction not found for reference:', reference, txError)
      return { success: false, message: 'Transaction not found' }
    }

    // Update transaction status
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        status: 'failed',
        paystack_reference: data.reference,
        updated_at: new Date().toISOString(),
      })
      .eq('reference', reference)

    if (transactionError) {
      console.error('Error updating transaction:', transactionError)
      return { success: false, message: 'Failed to update transaction' }
    }

    // Update related order status using transaction UUID
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transaction.id)

    if (orderError) {
      console.error('Error updating order:', orderError)
      return { success: false, message: 'Failed to update order' }
    }

    return { success: true, message: 'Charge failure processed' }
  } catch (error) {
    console.error('Error in handleChargeFailed:', error)
    return { success: false, message: 'Processing error' }
  }
}

async function handleRefundProcessed(supabase: any, data: any) {
  try {
    console.log('Processing refund:', data.reference)

    // Lookup transaction by reference to get its UUID id
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', data.transaction.reference)
      .single()

    if (txError || !transaction) {
      console.error('Transaction not found for refund:', data.transaction.reference, txError)
      return { success: false, message: 'Transaction not found' }
    }

    // Update order to refunded status using transaction UUID
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'refunded',
        admin_notes: `Refund processed: ${data.amount / 100} ${data.currency}`,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transaction.id)

    if (orderError) {
      console.error('Error updating order for refund:', orderError)
      return { success: false, message: 'Failed to update order' }
    }

    return { success: true, message: 'Refund processed' }
  } catch (error) {
    console.error('Error in handleRefundProcessed:', error)
    return { success: false, message: 'Processing error' }
  }
}

async function handleTransferEvent(supabase: any, data: any, eventType: string) {
  try {
    console.log('Processing transfer event:', eventType, data.reference)

    // Log transfer events for monitoring (these don't affect customer orders)
    await supabase.rpc('log_audit_event', {
      p_action: `TRANSFER_${eventType.split('.')[1].toUpperCase()}`,
      p_resource_type: 'transfer',
      p_resource_id: data.reference,
      p_details: {
        amount: data.amount,
        currency: data.currency,
        status: data.status
      }
    })

    return { success: true, message: `Transfer ${eventType.split('.')[1]} logged` }
  } catch (error) {
    console.error('Error in handleTransferEvent:', error)
    return { success: false, message: 'Processing error' }
  }
}

async function handleDisputeCreate(supabase: any, data: any) {
  try {
    console.log('Processing dispute creation:', data.id)

    // Lookup transaction by reference to get its UUID id
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', data.transaction.reference)
      .single()

    if (txError || !transaction) {
      console.error('Transaction not found for dispute:', data.transaction.reference, txError)
      return { success: false, message: 'Transaction not found' }
    }

    // Find the order related to this transaction
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('transaction_id', transaction.id)
      .single()

    if (findError || !order) {
      console.error('Could not find order for dispute:', findError)
      return { success: false, message: 'Order not found for dispute' }
    }

    // Create dispute record
    const { error: disputeError } = await supabase
      .from('disputes')
      .insert({
        order_id: order.id,
        user_id: order.user_id,
        reason: data.reason,
        description: data.message || 'Dispute created via Paystack',
        status: 'pending'
      })

    if (disputeError) {
      console.error('Error creating dispute record:', disputeError)
      return { success: false, message: 'Failed to create dispute record' }
    }

    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'disputed',
        admin_notes: `Dispute created: ${data.reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (orderError) {
      console.error('Error updating order for dispute:', orderError)
    }

    return { success: true, message: 'Dispute created and processed' }
  } catch (error) {
    console.error('Error in handleDisputeCreate:', error)
    return { success: false, message: 'Processing error' }
  }
}

async function handleDisputeResolve(supabase: any, data: any) {
  try {
    console.log('Processing dispute resolution:', data.id)

    // Lookup transaction by reference to get its UUID id
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', data.transaction.reference)
      .single()

    if (txError || !transaction) {
      console.error('Transaction not found for dispute resolution:', data.transaction.reference, txError)
      return { success: false, message: 'Transaction not found' }
    }

    // Find the order related to this transaction
    const { data: order, error: findOrderError } = await supabase
      .from('orders')
      .select('*')
      .eq('transaction_id', transaction.id)
      .single()

    if (findOrderError || !order) {
      console.error('Could not find order for dispute resolution:', findOrderError)
      return { success: false, message: 'Order not found for dispute resolution' }
    }

    // Find the most recent pending dispute for this order
    const { data: dispute, error: findDisputeError } = await supabase
      .from('disputes')
      .select('*')
      .eq('order_id', order.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (findDisputeError || !dispute) {
      console.error('Could not find pending dispute for order:', findDisputeError)
      return { success: false, message: 'Pending dispute not found' }
    }

    // Update dispute status based on resolution
    const { error: disputeError } = await supabase
      .from('disputes')
      .update({
        status: data.status === 'won' ? 'resolved' : 'lost',
        admin_notes: `Dispute ${data.status}: ${data.message || ''}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dispute.id)

    if (disputeError) {
      console.error('Error updating dispute:', disputeError)
    }

    // Update related order status
    const newOrderStatus = data.status === 'won' ? 'paid' : 'refunded'
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: newOrderStatus,
        admin_notes: `Dispute ${data.status}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (orderError) {
      console.error('Error updating order for dispute resolution:', orderError)
    }

    return { success: true, message: 'Dispute resolution processed' }
  } catch (error) {
    console.error('Error in handleDisputeResolve:', error)
    return { success: false, message: 'Processing error' }
  }
}

async function handleCustomerIdentification(supabase: any, data: any, eventType: string) {
  try {
    console.log('Processing customer identification:', eventType, data.customer_code)

    // Log KYC events for monitoring
    await supabase.rpc('log_audit_event', {
      p_action: `KYC_${eventType.split('.')[1].toUpperCase()}`,
      p_resource_type: 'customer_verification',
      p_resource_id: data.customer_code,
      p_details: {
        status: eventType.split('.')[1],
        customer_code: data.customer_code
      }
    })

    return { success: true, message: `Customer identification ${eventType.split('.')[1]} logged` }
  } catch (error) {
    console.error('Error in handleCustomerIdentification:', error)
    return { success: false, message: 'Processing error' }
  }
}
