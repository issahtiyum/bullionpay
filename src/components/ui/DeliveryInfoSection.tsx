
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DeliveryInfoSectionProps {
  deliveryInfo: string;
}

const DeliveryInfoSection: React.FC<DeliveryInfoSectionProps> = ({ deliveryInfo }) => {
  const { toast } = useToast();
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(deliveryInfo);
    toast({
      description: "Delivery information copied to clipboard",
    });
  };

  return (
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
            {deliveryInfo}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DeliveryInfoSection;
