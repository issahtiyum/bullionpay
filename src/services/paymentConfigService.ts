
import { supabase } from '@/integrations/supabase/client';

export type PaystackMode = 'live' | 'test';

export const setPaystackMode = async (mode: PaystackMode) => {
  const { data, error } = await supabase.functions.invoke('admin-set-paystack-mode', {
    body: { mode },
  });
  if (error) {
    console.error('Failed to set Paystack mode:', error);
    throw new Error(error.message || 'Failed to set Paystack mode');
  }
  return data as { success: boolean; mode: PaystackMode };
};

export const getPaystackConfig = async () => {
  const { data, error } = await supabase.functions.invoke('get-paystack-key');
  if (error) {
    console.error('Failed to get Paystack config:', error);
    throw new Error(error.message || 'Failed to get Paystack config');
  }
  return data as { publicKey: string; mode: PaystackMode };
};
