
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Order } from '@/hooks/useOrders';
import CustomFieldDataDisplay from './CustomFieldDataDisplay';

interface OrderEditModalProps {
  order: Order | null;
  onClose: () => void;
  onSave: (orderId: string, updates: Partial<Pick<Order, 'status' | 'delivery_info' | 'admin_notes' | 'attended'>>) => Promise<boolean>;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({ order, onClose, onSave }) => {
  const [editForm, setEditForm] = useState({
    status: '',
    delivery_info: '',
    admin_notes: '',
    attended: false
  });

  useEffect(() => {
    if (order) {
      setEditForm({
        status: order.status,
        delivery_info: order.delivery_info || '',
        admin_notes: order.admin_notes || '',
        attended: order.attended
      });
    }
  }, [order]);

  const handleSave = async () => {
    if (!order) return;
    
    const success = await onSave(order.id, editForm);
    if (success) {
      onClose();
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Edit Order - {order.product_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom Field Data Display */}
          {order.custom_field_data && Object.keys(order.custom_field_data).length > 0 && (
            <div>
              <Label className="font-medium">Customer Information</Label>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <CustomFieldDataDisplay customFieldData={order.custom_field_data} />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={editForm.status}
              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="delivery_info">Delivery Info</Label>
            <Input
              id="delivery_info"
              value={editForm.delivery_info}
              onChange={(e) => setEditForm({...editForm, delivery_info: e.target.value})}
              placeholder="Enter delivery information..."
            />
          </div>
          
          <div>
            <Label htmlFor="admin_notes">Admin Notes</Label>
            <Input
              id="admin_notes"
              value={editForm.admin_notes}
              onChange={(e) => setEditForm({...editForm, admin_notes: e.target.value})}
              placeholder="Internal notes..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="attended"
              checked={editForm.attended}
              onChange={(e) => setEditForm({...editForm, attended: e.target.checked})}
              className="rounded border-gray-300"
            />
            <Label htmlFor="attended">Mark as attended</Label>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderEditModal;
