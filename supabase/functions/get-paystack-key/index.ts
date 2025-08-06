
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const getSecurityHeaders = (additionalHeaders: Record<string, string> = {}) => {
  return {
    // CORS headers
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
    
    // Custom headers
    ...additionalHeaders
  };
};

const corsHeaders = getSecurityHeaders();

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (clientIP: string): boolean => {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 30; // 30 requests per minute
  
  let data = requestCounts.get(clientIP);
  
  if (!data || now > data.resetTime) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (data.count >= maxRequests) {
    return false;
  }
  
  data.count++;
  return true;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const paystackPublicKey = Deno.env.get('PAYSTACK_PUBLIC_KEY');
    
    if (!paystackPublicKey) {
      console.error('PAYSTACK_PUBLIC_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment configuration not available' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ publicKey: paystackPublicKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in get-paystack-key function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
