
import { supabase } from '@/integrations/supabase/client';

export class PaystackService {
  private static async getPaystackKey(): Promise<string> {
    const { data, error } = await supabase.functions.invoke('get-paystack-key');
    
    if (error || !data?.secretKey) {
      throw new Error('Failed to get Paystack configuration');
    }
    
    return data.secretKey;
  }

  static async verifyTransaction(reference: string): Promise<any> {
    try {
      const secretKey = await this.getPaystackKey();
      
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      return data;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  }

  static async getTransactionDetails(transactionId: string): Promise<any> {
    try {
      const secretKey = await this.getPaystackKey();
      
      const response = await fetch(
        `https://api.paystack.co/transaction/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get transaction details');
      }

      return data;
    } catch (error) {
      console.error('Paystack transaction details error:', error);
      throw error;
    }
  }

  static async initiateRefund(transactionReference: string, amount?: number): Promise<any> {
    try {
      const secretKey = await this.getPaystackKey();
      
      const response = await fetch(
        'https://api.paystack.co/refund',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction: transactionReference,
            amount: amount ? amount * 100 : undefined // Convert to kobo if specified
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Refund initiation failed');
      }

      return data;
    } catch (error) {
      console.error('Paystack refund error:', error);
      throw error;
    }
  }
}
