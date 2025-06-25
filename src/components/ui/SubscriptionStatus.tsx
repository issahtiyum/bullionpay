
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, RefreshCw, XCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatusProps {
  order: {
    id: string;
    productId: string;
    status: 'Paid' | 'Delivered' | 'Pending';
    isSubscription?: boolean;
    nextBillingDate?: string;
  };
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ order }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  if (!order.isSubscription) return null;

  const daysRemaining = getDaysRemaining();
  const expired = isSubscriptionExpired();
  const showRenewOption = isServiceDelivered() && (daysRemaining !== null && (daysRemaining <= 7 || expired));
  const subscriptionStatusText = getSubscriptionStatusText();

  return (
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
  );
};

export default SubscriptionStatus;
