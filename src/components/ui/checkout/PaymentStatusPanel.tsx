
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

type PaymentStatusPanelProps = {
  awaitingConfirmation: boolean;
  loading: boolean;
  onVerifyNow: () => void;
};

const PaymentStatusPanel: React.FC<PaymentStatusPanelProps> = ({
  awaitingConfirmation,
  loading,
  onVerifyNow
}) => {
  if (!awaitingConfirmation) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-shrink-0">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-orange-900">Awaiting Payment Confirmation</h3>
            <p className="text-sm text-orange-700">
              Your payment has been submitted and is being processed. This usually takes a few seconds.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onVerifyNow}
            disabled={loading}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verify Now
              </>
            )}
          </Button>
          <span className="text-xs text-orange-600">
            or wait for automatic confirmation
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStatusPanel;
