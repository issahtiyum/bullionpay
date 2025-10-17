import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getPaystackConfig, setPaystackMode, type PaystackMode } from '@/services/paymentConfigService';
import { AlertTriangle, Settings, CheckCircle, Copy, TestTube2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
const PaymentSettings = () => {
  const [currentMode, setCurrentMode] = useState<PaystackMode>('live');
  const [testModeOverride, setTestModeOverride] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const { toast } = useToast();
  const { adminUser } = useAdmin();
  const webhookUrl = 'https://jxiiletuljcxulpltdss.supabase.co/functions/v1/paystack-webhook';
  useEffect(() => {
    fetchCurrentMode();
  }, [adminUser]);
  const fetchCurrentMode = async () => {
    try {
      // Fetch global mode directly from payment_config table
      const { data: configData, error: configError } = await supabase
        .from('payment_config')
        .select('active_mode')
        .eq('id', 'paystack')
        .single();

      if (configError) throw configError;
      setCurrentMode((configData?.active_mode as PaystackMode) || 'live');

      // Fetch personal test mode override separately
      if (adminUser) {
        const { data, error } = await supabase
          .from('admin_users')
          .select('test_mode_override')
          .eq('user_id', adminUser.user_id)
          .single();
        
        if (!error && data) {
          setTestModeOverride(data.test_mode_override ?? false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch current mode:', error);
      toast({
        title: "Error",
        description: "Failed to load payment configuration",
        variant: "destructive"
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
        description: `Switched to ${newMode.toUpperCase()} mode successfully`
      });
    } catch (error) {
      console.error('Failed to switch mode:', error);
      toast({
        title: "Error",
        description: `Failed to switch to ${newMode} mode`,
        variant: "destructive"
      });
    } finally {
      setIsSwitching(false);
    }
  };
  const handleTestModeOverrideToggle = async (checked: boolean) => {
    if (!adminUser) return;
    
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ test_mode_override: checked })
        .eq('user_id', adminUser.user_id);

      if (error) throw error;

      setTestModeOverride(checked);
      toast({
        title: checked ? 'Personal test mode enabled' : 'Personal test mode disabled',
        description: checked 
          ? 'Your payments will now use TEST mode'
          : 'Your payments will now use the global payment mode',
      });
    } catch (error) {
      console.error('Failed to toggle test mode:', error);
      toast({
        title: 'Error',
        description: 'Failed to update test mode setting',
        variant: 'destructive',
      });
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard"
    });
  };
  
  const getEffectiveMode = () => {
    if (testModeOverride) return 'test';
    return currentMode;
  };
  
  const effectiveMode = getEffectiveMode();
  if (isLoading) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading payment configuration...</p>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-6">
      {/* Current Status Summary */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {effectiveMode === 'test' ? (
                <TestTube2 className="h-8 w-8 text-yellow-600" />
              ) : (
                <Shield className="h-8 w-8 text-green-600" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Your Payment Mode</p>
                <p className="text-2xl font-bold">
                  {effectiveMode === 'test' ? '🧪 TEST MODE' : '💰 LIVE MODE'}
                </p>
              </div>
            </div>
            <Badge 
              variant={effectiveMode === 'live' ? 'default' : 'secondary'} 
              className={effectiveMode === 'live' ? 'bg-green-100 text-green-800 text-lg px-4 py-2' : 'bg-yellow-100 text-yellow-800 text-lg px-4 py-2'}
            >
              {effectiveMode === 'test' ? 'Testing' : 'Production'}
            </Badge>
          </div>
          
          {testModeOverride && currentMode === 'live' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ℹ️ You have personal test mode enabled. Customers see LIVE mode, but your payments use TEST mode.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Testing Tools */}
      {currentMode === 'live' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube2 className="h-5 w-5" />
              Admin Testing Tools
            </CardTitle>
            <CardDescription>
              Test payments without affecting customer experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="space-y-1">
                  <Label htmlFor="admin-test-mode" className="text-base font-medium">
                    Personal Test Mode Override
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable TEST mode only for your payments while customers use LIVE mode
                  </p>
                </div>
                <Switch
                  id="admin-test-mode"
                  checked={testModeOverride}
                  onCheckedChange={handleTestModeOverrideToggle}
                />
              </div>
              
              {testModeOverride && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium mb-1">
                    ⚠️ Personal Test Mode Active
                  </p>
                  <p className="text-sm text-yellow-700">
                    Your payments will use TEST mode. Regular customers continue using LIVE mode normally.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure this webhook URL in your Paystack dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Webhook URL</Label>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-muted rounded-md text-sm break-all">
                {webhookUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyWebhookUrl}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add this URL to both test and live webhook settings in your Paystack dashboard
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System-Wide Payment Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System-Wide Payment Mode
          </CardTitle>
          <CardDescription>
            Controls the payment mode for all customers and admins (unless overridden)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="paystack-mode" className="text-base font-medium">
                  Global Payment Mode
                </Label>
                <Badge variant={currentMode === 'live' ? 'default' : 'secondary'} className={currentMode === 'live' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {currentMode.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentMode === 'live' 
                  ? 'Real transactions will be processed for all users' 
                  : 'Test transactions only - no real money involved for anyone'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="paystack-mode" className="text-sm text-muted-foreground">Test</Label>
              <Switch 
                id="paystack-mode" 
                checked={currentMode === 'live'} 
                onCheckedChange={handleModeSwitch} 
                disabled={isSwitching} 
              />
              <Label htmlFor="paystack-mode" className="text-sm text-muted-foreground">Live</Label>
            </div>
          </div>

          {isSwitching && <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Switching modes...
            </div>}
            
          <div className="pt-4 border-t">
            {currentMode === 'live' ? (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">
                    LIVE MODE ACTIVE
                  </p>
                  <p className="text-sm text-muted-foreground">
                    All customer transactions will process real money. Use test mode for development.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">
                    TEST MODE ACTIVE
                  </p>
                  <p className="text-sm text-muted-foreground">
                    All transactions are simulated. No real money will be charged. Perfect for testing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default PaymentSettings;