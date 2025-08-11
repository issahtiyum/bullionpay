
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getPaystackConfig, setPaystackMode, type PaystackMode } from '@/services/paymentConfigService';
import { AlertTriangle, Settings, CheckCircle, Copy, ExternalLink } from 'lucide-react';

const PaymentSettings = () => {
  const [currentMode, setCurrentMode] = useState<PaystackMode>('live');
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const { toast } = useToast();

  const webhookUrl = 'https://jxiiletuljcxulpltdss.supabase.co/functions/v1/paystack-webhook';

  useEffect(() => {
    fetchCurrentMode();
  }, []);

  const fetchCurrentMode = async () => {
    try {
      const config = await getPaystackConfig();
      setCurrentMode(config.mode);
    } catch (error) {
      console.error('Failed to fetch current mode:', error);
      toast({
        title: "Error",
        description: "Failed to load payment configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = async (isLiveMode: boolean) => {
    const newMode: PaystackMode = isLiveMode ? 'live' : 'test';
    
    if (newMode === currentMode) return;

    setIsSwitching(true);
    try {
      await setPaystackMode(newMode);
      setCurrentMode(newMode);
      
      toast({
        title: "Payment mode updated",
        description: `Switched to ${newMode.toUpperCase()} mode successfully`,
      });
    } catch (error) {
      console.error('Failed to switch mode:', error);
      toast({
        title: "Error",
        description: `Failed to switch to ${newMode} mode`,
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading payment configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paystack Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="paystack-mode" className="text-base font-medium">
                  Payment Mode
                </Label>
                <Badge 
                  variant={currentMode === 'live' ? 'default' : 'secondary'}
                  className={currentMode === 'live' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                >
                  {currentMode.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {currentMode === 'live' 
                  ? 'Real transactions will be processed' 
                  : 'Test transactions only - no real money involved'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="paystack-mode" className="text-sm">Test</Label>
              <Switch
                id="paystack-mode"
                checked={currentMode === 'live'}
                onCheckedChange={handleModeSwitch}
                disabled={isSwitching}
              />
              <Label htmlFor="paystack-mode" className="text-sm">Live</Label>
            </div>
          </div>

          {isSwitching && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              Switching modes...
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Webhook URL</Label>
            <p className="text-xs text-gray-600 mb-2">
              Use this URL for both Test and Live webhook configurations in your Paystack dashboard
            </p>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
              <code className="flex-1 text-sm font-mono break-all">
                {webhookUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyWebhookUrl}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Events to Subscribe</Label>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• charge.success</li>
              <li>• charge.failed</li>
              <li>• refund.processed</li>
              <li>• dispute.create</li>
              <li>• dispute.resolve</li>
            </ul>
          </div>

          <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
            <p className="font-medium mb-1">Configuration Steps:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Copy the webhook URL above</li>
              <li>Go to your Paystack Dashboard → Settings → Webhooks</li>
              <li>Add the webhook URL for both Test and Live environments</li>
              <li>Subscribe to the events listed above</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentMode === 'live' ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Mode Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentMode === 'live' ? (
            <div className="space-y-2">
              <p className="text-sm text-red-600 font-medium">
                ⚠️ LIVE MODE ACTIVE
              </p>
              <p className="text-sm text-gray-600">
                All transactions will process real money. Use test mode for development and testing.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">
                ✅ TEST MODE ACTIVE
              </p>
              <p className="text-sm text-gray-600">
                All transactions are simulated. No real money will be charged. Perfect for testing.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;
