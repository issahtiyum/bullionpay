
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SubscriptionStatus from './SubscriptionStatus';
import DeliveryInfoSection from './DeliveryInfoSection';
import AdminNotesSection from './AdminNotesSection';

export type Order = {
  id: string;
  productId: string;
  productName: string;
  orderDate: string;
  status: 'Paid' | 'Delivered' | 'Pending';
  deliveryInfo?: string;
  adminNotes?: string;
  isSubscription?: boolean;
  nextBillingDate?: string;
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900">{order.productName}</h3>
          <span 
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              order.status === 'Delivered' 
                ? 'bg-green-100 text-green-800' 
                : order.status === 'Paid' 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {order.status}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mb-3">
          Ordered on {new Date(order.orderDate).toLocaleDateString()}
        </p>
        
        <SubscriptionStatus order={order} />
        
        {order.deliveryInfo && (
          <DeliveryInfoSection deliveryInfo={order.deliveryInfo} />
        )}
        
        {order.adminNotes && (
          <AdminNotesSection adminNotes={order.adminNotes} />
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
