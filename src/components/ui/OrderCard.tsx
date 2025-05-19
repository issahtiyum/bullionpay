
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export type Order = {
  id: string;
  productName: string;
  orderDate: string;
  status: 'Paid' | 'Delivered' | 'Pending';
  deliveryInfo?: string;
  adminNotes?: string;
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const { toast } = useToast();
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  
  const handleCopy = () => {
    if (order.deliveryInfo) {
      navigator.clipboard.writeText(order.deliveryInfo);
      toast({
        description: "Delivery information copied to clipboard",
      });
    }
  };
  
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
        
        {order.deliveryInfo && (
          <Collapsible 
            open={showDeliveryInfo}
            onOpenChange={setShowDeliveryInfo}
            className="mt-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Delivery Information:</span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy} 
                  className="h-8 w-8 p-0"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </Button>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    title={showDeliveryInfo ? "Hide information" : "Show information"}
                  >
                    {showDeliveryInfo ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 break-words">
                  {order.deliveryInfo}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {order.adminNotes && (
          <div className="mt-3 p-3 bg-bullion-purple-50 border border-bullion-purple-200 rounded-md">
            <span className="text-sm font-medium block mb-1">Admin Notes:</span>
            <p className="text-sm text-gray-600">{order.adminNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
