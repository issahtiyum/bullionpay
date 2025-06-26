
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders with custom field data...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          product_name,
          amount,
          status,
          created_at,
          delivery_info,
          admin_notes,
          attended,
          is_subscription,
          next_billing_date,
          custom_field_data
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log('Fetched orders:', data);
      
      // Log orders with custom field data for debugging
      const ordersWithCustomData = data?.filter(order => 
        order.custom_field_data && 
        typeof order.custom_field_data === 'object' && 
        Object.keys(order.custom_field_data).length > 0
      );
      
      console.log('Orders with custom field data:', ordersWithCustomData);
      
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
    try {
      console.log('Updating order:', orderId, updates);
      
      const { error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Order updated successfully",
      });

      fetchOrders();
      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleAttendedStatus = async (order: Order) => {
    console.log('Toggling attended status for order:', order.id);
    return updateOrder(order.id, { attended: !order.attended });
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
