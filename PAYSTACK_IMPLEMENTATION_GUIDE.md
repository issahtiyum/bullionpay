# Paystack Implementation Guide

This document provides a comprehensive guide on how Paystack payment processing is implemented in this application.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Setup](#database-setup)
3. [Environment Variables & Secrets](#environment-variables--secrets)
4. [Edge Functions](#edge-functions)
5. [Frontend Implementation](#frontend-implementation)
6. [Payment Flow](#payment-flow)
7. [Test vs Live Mode](#test-vs-live-mode)
8. [Security Considerations](#security-considerations)

---

## Architecture Overview

The Paystack implementation follows a secure, multi-layered architecture:

```
Frontend (React) 
    ↓
Payment Hooks (usePaystackIntegration, usePaymentProcessing)
    ↓
Supabase Edge Functions (get-paystack-key, verify-payment-secure)
    ↓
Paystack API
    ↓
Webhook Processing (paystack-webhook)
    ↓
Database (Supabase)
```

### Key Components:
- **Frontend**: React components and hooks for payment initiation
- **Edge Functions**: Serverless functions for secure API key retrieval and payment verification
- **Database**: Supabase PostgreSQL for storing transactions, orders, and configuration
- **Webhook**: Real-time payment confirmation handler

---

## Database Setup

### 1. Tables Created

#### `payment_config`
Stores the active payment mode (test/live):
```sql
CREATE TABLE payment_config (
  id TEXT PRIMARY KEY,
  active_mode TEXT NOT NULL DEFAULT 'live',
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `transactions`
Records all payment transactions:
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  reference TEXT NOT NULL,
  paystack_reference TEXT,
  status TEXT NOT NULL,
  currency TEXT DEFAULT 'GHS',
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `orders`
Stores order information linked to transactions:
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_id UUID,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  delivery_info TEXT,
  custom_field_data JSONB DEFAULT '{}'::jsonb,
  is_subscription BOOLEAN DEFAULT false,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  is_test BOOLEAN DEFAULT false,
  admin_notes TEXT,
  attended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `processed_webhooks`
Prevents duplicate webhook processing:
```sql
CREATE TABLE processed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  success BOOLEAN DEFAULT true,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2. Row Level Security (RLS)
All tables have RLS enabled with policies that:
- Allow users to view/manage their own records
- Allow admins to view/manage all records
- Prevent unauthorized access

---

## Environment Variables & Secrets

### Supabase Secrets (Server-side)
These are stored securely in Supabase and accessed by Edge Functions:

```
PAYSTACK_PUBLIC_KEY_LIVE     # Live mode public key
PAYSTACK_PUBLIC_KEY_TEST     # Test mode public key
PAYSTACK_SECRET_KEY_LIVE     # Live mode secret key
PAYSTACK_SECRET_KEY_TEST     # Test mode secret key
SUPABASE_URL                 # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY    # Service role key for admin operations
```

### How to Set Secrets
1. Go to Supabase Dashboard → Project Settings → Edge Functions → Manage Secrets
2. Add each secret with its corresponding value
3. Deploy your edge functions (they automatically access these secrets)

---

## Edge Functions

### 1. `get-paystack-key`
**Purpose**: Securely retrieves the appropriate Paystack public key based on active mode

**Location**: `supabase/functions/get-paystack-key/index.ts`

**Flow**:
```typescript
1. Check rate limits (protect against abuse)
2. Query payment_config table for active_mode
3. Determine which public key to use (test or live)
4. Return public key and mode to frontend
```

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('get-paystack-key');
// Returns: { publicKey: 'pk_...', mode: 'live' | 'test' }
```

### 2. `verify-payment-secure`
**Purpose**: Securely verifies payment with Paystack API

**Location**: `supabase/functions/verify-payment-secure/index.ts`

**Flow**:
```typescript
1. Authenticate user via JWT
2. Check rate limits
3. Validate authorization (user owns transaction)
4. Determine payment mode from reference or config
5. Call Paystack verification API
6. Log audit event
7. Return verification result
```

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('verify-payment-secure', {
  body: { reference: 'ps_test_123...' }
});
```

### 3. `paystack-webhook`
**Purpose**: Handles real-time payment confirmations from Paystack

**Location**: `supabase/functions/paystack-webhook/index.ts`

**Flow**:
```typescript
1. Verify webhook signature (security)
2. Check if webhook already processed (idempotency)
3. Extract payment data
4. Update transaction status
5. Update order status
6. Record webhook as processed
```

**Webhook Setup**:
1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://[project-id].supabase.co/functions/v1/paystack-webhook`
3. Select events: `charge.success`

### 4. `admin-set-paystack-mode`
**Purpose**: Allows super admins to switch between test and live mode

**Location**: `supabase/functions/admin-set-paystack-mode/index.ts`

**Flow**:
```typescript
1. Authenticate super admin
2. Validate mode (test or live)
3. Update payment_config table
4. Return success confirmation
```

---

## Frontend Implementation

### 1. Payment Utilities
**File**: `src/utils/paymentUtils.ts`

```typescript
// Generate unique payment reference
generatePaymentReference(mode: 'live' | 'test'): string

// Convert amount to kobo (Paystack uses smallest currency unit)
convertToKobo(amount: number): number

// Load Paystack script dynamically
loadPaystackScript(): Promise<void>
```

### 2. Core Services

#### Payment Config Service
**File**: `src/services/paymentConfigService.ts`

```typescript
// Get current Paystack configuration
getPaystackConfig(): Promise<{ publicKey: string, mode: PaystackMode }>

// Set payment mode (admin only)
setPaystackMode(mode: PaystackMode): Promise<{ success: boolean, mode: PaystackMode }>
```

#### Paystack Service
**File**: `src/services/paystackService.ts`

```typescript
// Verify transaction with Paystack
verifyTransaction(reference: string): Promise<any>

// Get transaction details
getTransactionDetails(transactionId: string): Promise<any>

// Initiate refund
initiateRefund(transactionReference: string, amount?: number): Promise<any>
```

### 3. Payment Hooks

#### `usePaystackIntegration`
**File**: `src/hooks/usePaystackIntegration.ts`

Handles Paystack popup initialization:
```typescript
const { initializePaystackPayment } = usePaystackIntegration();

initializePaystackPayment(
  product,
  email,
  onSuccess,
  onClose,
  preGeneratedReference
);
```

#### `usePaymentProcessing`
**File**: `src/hooks/usePaymentProcessing.ts`

Main payment processing logic:
```typescript
const { loading, processPayment } = usePaymentProcessing(product, onSuccess);

await processPayment(email, customFieldValues, customFields);
```

### 4. React Components

#### Payment Button
**File**: `src/components/ui/checkout/PaymentButton.tsx`

Simple button component for initiating payment.

#### Payment Settings (Admin)
**File**: `src/components/admin/PaymentSettings.tsx`

Admin interface for switching between test and live mode.

---

## Payment Flow

### Complete Payment Journey

```
1. User browses products
   ↓
2. User clicks "Pay Now" on CheckoutForm
   ↓
3. Frontend validates inputs (email, custom fields)
   ↓
4. Hook generates payment reference (ps_test_* or ps_live_*)
   ↓
5. Edge function fetches appropriate public key
   ↓
6. Transaction record created in database (status: 'pending')
   ↓
7. Order record created (status: 'pending')
   ↓
8. Paystack popup opens
   ↓
9. User completes payment
   ↓
10. Paystack sends callback to frontend
   ↓
11. Frontend calls verify-payment-secure edge function
   ↓
12. Edge function verifies with Paystack API
   ↓
13. Transaction updated (status: 'success' or 'failed')
   ↓
14. Order updated (status: 'paid' or 'failed')
   ↓
15. User sees success/error message
   ↓
16. [In parallel] Paystack sends webhook
   ↓
17. Webhook confirms payment (backup verification)
```

### Code Example - Complete Payment Flow

```typescript
// In CheckoutForm component
const { processPayment, loading } = usePaymentProcessing(product, onSuccess);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate inputs
  if (!email || !isValidEmail(email)) {
    toast.error("Please enter a valid email");
    return;
  }
  
  // Process payment
  await processPayment(email, customFieldValues, customFields);
};

// Behind the scenes:
// 1. usePaymentProcessing creates transaction & order
// 2. Calls usePaystackIntegration to open popup
// 3. On success, verifies payment
// 4. Updates database records
// 5. Shows success toast
```

---

## Test vs Live Mode

### How Mode Switching Works

1. **Admin switches mode** via PaymentSettings component
2. **Mode stored** in `payment_config` table
3. **Edge function reads mode** when fetching public key
4. **Frontend receives** appropriate key (test or live)
5. **Reference generated** with mode prefix (ps_test_* or ps_live_*)
6. **Orders tagged** with `is_test` boolean flag

### Testing Payments

#### Test Mode Setup:
1. Get test keys from Paystack Dashboard → Settings → API Keys & Webhooks
2. Add to Supabase secrets as `PAYSTACK_SECRET_KEY_TEST` and `PAYSTACK_PUBLIC_KEY_TEST`
3. Switch to test mode in admin panel

#### Test Cards:
```
Successful Payment:
  Card: 4084 0840 8408 4081
  CVV: 408
  Expiry: 12/25
  PIN: 0000
  OTP: 123456

Failed Payment:
  Card: 5060 6666 6666 6666
  CVV: 123
  Expiry: 12/25
```

### Going Live:
1. Complete Paystack business verification
2. Get live keys from Paystack Dashboard
3. Add to Supabase secrets as `PAYSTACK_SECRET_KEY_LIVE` and `PAYSTACK_PUBLIC_KEY_LIVE`
4. Update webhook URL in Paystack Dashboard
5. Switch to live mode in admin panel
6. Test with small real transaction
7. Monitor orders and webhook logs

---

## Security Considerations

### 1. API Key Protection
✅ **What we do**:
- Store secret keys in Supabase Edge Function secrets
- Never expose secret keys to frontend
- Only return public keys to client
- Rate limit API key requests

❌ **Never do**:
- Store API keys in frontend code
- Commit API keys to git
- Share keys in plain text

### 2. Payment Verification
✅ **What we do**:
- Double verification (frontend callback + webhook)
- Verify webhook signatures
- Check transaction ownership before verification
- Prevent duplicate processing

### 3. User Authorization
✅ **What we do**:
- Authenticate users via JWT
- Verify users can only access their own transactions
- Admin-only routes for sensitive operations
- RLS policies on all tables

### 4. Input Sanitization
✅ **What we do**:
- Sanitize all user inputs (email, custom fields)
- Validate amounts and references
- Use DOMPurify for HTML content
- Prevent SQL injection via parameterized queries

### 5. Audit Logging
✅ **What we do**:
- Log all payment verifications
- Track mode switches
- Record failed authentication attempts
- Monitor suspicious activity

### 6. Rate Limiting
✅ **What we do**:
- Limit payment verification requests
- Throttle webhook processing
- Prevent API key request spam

---

## Troubleshooting

### Common Issues

#### 1. "Failed to get Paystack configuration"
**Cause**: Missing secrets or wrong mode configuration
**Solution**: 
- Check Supabase secrets are set correctly
- Verify `payment_config` table has a record with `active_mode`
- Check edge function logs

#### 2. Payment popup doesn't open
**Cause**: Paystack script not loaded or wrong public key
**Solution**:
- Check browser console for errors
- Verify `get-paystack-key` edge function returns valid key
- Ensure Paystack script CDN is accessible

#### 3. Payment succeeds but order not updated
**Cause**: Webhook not configured or verification failed
**Solution**:
- Verify webhook URL in Paystack Dashboard
- Check `processed_webhooks` table for errors
- Review edge function logs for `paystack-webhook`

#### 4. Test payments not working
**Cause**: Using live keys instead of test keys
**Solution**:
- Verify mode is set to 'test' in admin panel
- Confirm test keys are in Supabase secrets
- Check transaction reference has `ps_test_` prefix

### Debugging Tools

1. **Edge Function Logs**:
   - Supabase Dashboard → Edge Functions → [function name] → Logs

2. **Database Queries**:
   ```sql
   -- Check recent transactions
   SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
   
   -- Check payment config
   SELECT * FROM payment_config;
   
   -- Check webhook processing
   SELECT * FROM processed_webhooks ORDER BY created_at DESC LIMIT 10;
   ```

3. **Network Tab**:
   - Open browser DevTools → Network
   - Filter for 'paystack' or 'supabase'
   - Check request/response details

---

## Summary

This Paystack implementation provides:
- ✅ Secure API key management
- ✅ Test and live mode switching
- ✅ Double payment verification (callback + webhook)
- ✅ Comprehensive error handling
- ✅ Admin controls and monitoring
- ✅ Audit logging and security
- ✅ User-friendly payment flow

For questions or issues, check the edge function logs and database records to trace the payment flow.
