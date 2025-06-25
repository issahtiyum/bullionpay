
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAdminValidation = () => {
  const { isAdmin, adminRole, adminUser } = useAdmin();
  const { toast } = useToast();

  const validateAdminAction = async (requiredRole?: 'super_admin' | 'admin' | 'moderator') => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      return false;
    }

    if (requiredRole && adminRole !== requiredRole && adminRole !== 'super_admin') {
      toast({
        title: "Insufficient Permissions",
        description: `This action requires ${requiredRole} role`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const logAdminAction = async (action: string, details: Record<string, any>) => {
    if (!adminUser) return;

    try {
      // Log to console for now - will be replaced with proper audit logging once types are updated
      console.log('Admin Action:', {
        action: action,
        table_name: 'admin_actions',
        record_id: adminUser.id,
        admin_email: adminUser.email,
        admin_role: adminRole,
        details: details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

  const secureUpdateOrder = async (orderId: string, updates: any) => {
    if (!(await validateAdminAction())) return false;

    const { error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
      return false;
    }

    await logAdminAction('ORDER_UPDATED', {
      order_id: orderId,
      updates: updates
    });

    toast({
      title: "Success",
      description: "Order updated successfully",
    });
    return true;
  };

  const secureDeleteProduct = async (productId: string) => {
    if (!(await validateAdminAction('admin'))) return false;

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate product",
        variant: "destructive",
      });
      return false;
    }

    await logAdminAction('PRODUCT_DEACTIVATED', {
      product_id: productId
    });

    toast({
      title: "Success",
      description: "Product deactivated successfully",
    });
    return true;
  };

  return {
    validateAdminAction,
    logAdminAction,
    secureUpdateOrder,
    secureDeleteProduct,
    isValidAdmin: isAdmin,
    adminRole,
  };
};
