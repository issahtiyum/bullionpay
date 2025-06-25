
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminValidation } from './useAdminValidation';
import type { Json } from '@/integrations/supabase/types';

export type Order = {
  id: string;
  user_id: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string;
  delivery_info: string | null;
  admin_notes: string | null;
  attended: boolean;
  is_subscription: boolean | null;
  next_billing_date: string | null;
  custom_field_data: Json | null;
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { secureUpdateOrder, logAdminAction } = useAdminValidation();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (
    orderId: string, 
    updates: Partial<Pick<Order, 'status' | 'delivery_info' | 'admin_notes' | 'attended'>>
  ) => {
    const success = await secureUpdateOrder(orderId, updates);
    if (success) {
      fetchOrders();
    }
    return success;
  };

  const toggleAttendedStatus = async (order: Order) => {
    const success = await secureUpdateOrder(order.id, { attended: !order.attended });
    if (success) {
      await logAdminAction('ORDER_ATTENDANCE_TOGGLED', {
        order_id: order.id,
        new_status: !order.attended,
        product_name: order.product_name
      });
    }
    return success;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    fetchOrders,
    updateOrder,
    toggleAttendedStatus
  };
};
