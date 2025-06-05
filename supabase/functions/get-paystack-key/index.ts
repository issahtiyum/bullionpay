
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackPublicKey = Deno.env.get('PAYSTACK_PUBLIC_KEY');
    
    if (!paystackPublicKey) {
      console.error('PAYSTACK_PUBLIC_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Paystack public key not configured' }),
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
      JSON.stringify({ error: 'Failed to get Paystack key' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
