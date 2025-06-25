
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff, Clock, RefreshCw, XCircle, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  
  const handleCopy = () => {
    if (order.deliveryInfo) {
      navigator.clipboard.writeText(order.deliveryInfo);
      toast({
        description: "Delivery information copied to clipboard",
      });
    }
  };

  // Check if service has been delivered
  const isServiceDelivered = () => {
    return order.status === 'Delivered';
  };

  // Calculate days remaining for subscription
  const getDaysRemaining = () => {
    if (!order.isSubscription || !order.nextBillingDate || !isServiceDelivered()) {
      return null;
    }
    
    const today = new Date();
    const nextBilling = new Date(order.nextBillingDate);
    const diffTime = nextBilling.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Check if subscription is expired
  const isSubscriptionExpired = () => {
    const daysRemaining = getDaysRemaining();
    return daysRemaining !== null && daysRemaining < 0;
  };
  
  // Get subscription status text
  const getSubscriptionStatusText = () => {
    if (!order.isSubscription) return null;
    
    if (!isServiceDelivered()) {
      return "Awaiting delivery to start subscription";
    }
    
    const daysRemaining = getDaysRemaining();
    if (daysRemaining === null) return null;
    
    if (daysRemaining < 0) {
      return "Expired";
    }
    
    return `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`;
  };
  
  // Get color based on days remaining
  const getTimeRemainingColor = (daysRemaining: number | null) => {
    if (!isServiceDelivered()) return "text-amber-600";
    if (daysRemaining === null) return "text-gray-600";
    if (daysRemaining < 0) return "text-red-600";
    if (daysRemaining <= 3) return "text-red-600";
    if (daysRemaining <= 7) return "text-amber-600";
    if (daysRemaining <= 14) return "text-bullion-purple-600";
    return "text-bullion-purple-400";
  };
  
  // Get progress percentage for subscription time remaining
  const getTimeRemainingPercentage = (daysRemaining: number | null) => {
    if (!isServiceDelivered()) return 0; // No progress until delivered
    if (daysRemaining === null) return 0;
    if (daysRemaining < 0) return 100; // Full bar for expired
    // Assume a standard 30-day billing cycle
    const billingCycle = 30;
    const daysUsed = billingCycle - daysRemaining;
    return Math.min(100, Math.max(0, (daysUsed / billingCycle) * 100));
  };
  
  // Handle renewal for subscription
  const handleRenew = () => {
    if (order.productId) {
      navigate(`/checkout/${order.productId}`);
    } else {
      toast({
        title: "Unable to renew",
        description: "Product information not available for renewal.",
        variant: "destructive",
      });
    }
  };
  
  const daysRemaining = getDaysRemaining();
  const expired = isSubscriptionExpired();
  const showRenewOption = order.isSubscription && isServiceDelivered() && (daysRemaining !== null && (daysRemaining <= 7 || expired));
  const subscriptionStatusText = getSubscriptionStatusText();
  
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
        
        {order.isSubscription && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                {!isServiceDelivered() ? (
                  <Package size={16} className="mr-1 text-amber-500" />
                ) : expired ? (
                  <XCircle size={16} className="mr-1 text-red-500" />
                ) : (
                  <Clock size={16} className="mr-1 text-gray-500" />
                )}
                <span className="text-sm font-medium">
                  {!isServiceDelivered() ? 'Subscription status:' : 
                   expired ? 'Subscription status:' : 'Subscription renewal:'}
                </span>
              </div>
              <span className={`text-sm font-medium ${getTimeRemainingColor(daysRemaining)}`}>
                {subscriptionStatusText}
              </span>
            </div>
            
            {isServiceDelivered() && (
              <Progress 
                value={getTimeRemainingPercentage(daysRemaining)} 
                className={`h-2 ${expired ? 'opacity-75' : ''}`}
              />
            )}
            
            {showRenewOption && (
              <div className="mt-2 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRenew}
                  className="text-xs"
                >
                  <RefreshCw size={14} className="mr-1" />
                  {expired ? 'Reactivate' : 'Renew Now'}
                </Button>
              </div>
            )}
          </div>
        )}
        
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
