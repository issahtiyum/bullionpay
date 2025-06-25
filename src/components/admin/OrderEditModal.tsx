
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Order } from '@/hooks/useOrders';

interface OrderEditModalProps {
  order: Order | null;
  onClose: () => void;
  onSave: (orderId: string, updates: any) => Promise<boolean>;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({ order, onClose, onSave }) => {
  const [status, setStatus] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [attended, setAttended] = useState(false);
  const [subscriptionDays, setSubscriptionDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setDeliveryInfo(order.delivery_info || '');
      setAdminNotes(order.admin_notes || '');
      setAttended(order.attended);
      
      // Calculate current subscription days if it's a subscription
      if (order.custom_field_data && typeof order.custom_field_data === 'object') {
        const customData = order.custom_field_data as any;
        setSubscriptionDays(customData.subscription_days || 30);
      } else {
        setSubscriptionDays(30);
      }
    }
  }, [order]);

  const handleSave = async () => {
    if (!order) return;

    setIsSubmitting(true);
    
    const updates: any = {
      status,
      delivery_info: deliveryInfo || null,
      admin_notes: adminNotes || null,
      attended,
    };

    // If it's a subscription and subscription days changed, update the billing date
    if (order.is_subscription && subscriptionDays !== 30) {
      const currentDate = new Date();
      const newBillingDate = new Date(currentDate.getTime() + subscriptionDays * 24 * 60 * 60 * 1000);
      updates.next_billing_date = newBillingDate.toISOString();
      
      // Store the custom subscription duration in custom_field_data
      const existingCustomData = (order.custom_field_data as any) || {};
      updates.custom_field_data = {
        ...existingCustomData,
        subscription_days: subscriptionDays
      };
    }

    const success = await onSave(order.id, updates);
    if (success) {
      onClose();
    }
    setIsSubmitting(false);
  };

  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Product: {order.product_name}</Label>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {order.is_subscription && (
            <div>
              <Label htmlFor="subscriptionDays">Subscription Duration (Days)</Label>
              <Input
                id="subscriptionDays"
                type="number"
                min="1"
                max="365"
                value={subscriptionDays}
                onChange={(e) => setSubscriptionDays(parseInt(e.target.value) || 30)}
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default is 30 days. This will update the billing date from today.
              </p>
            </div>
          )}
          
          <div>
            <Label htmlFor="deliveryInfo">Delivery Information</Label>
            <Textarea
              id="deliveryInfo"
              value={deliveryInfo}
              onChange={(e) => setDeliveryInfo(e.target.value)}
              placeholder="Enter delivery details..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes..."
              rows={2}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="attended"
              checked={attended}
              onCheckedChange={setAttended}
            />
            <Label htmlFor="attended">Mark as Attended/Delivered</Label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditModal;
