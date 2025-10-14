import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdmin } from '@/contexts/AdminContext';

const AdminTestModeToggle = () => {
  const [testModeOverride, setTestModeOverride] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin, adminUser } = useAdmin();

  useEffect(() => {
    if (isAdmin && adminUser) {
      fetchTestModeStatus();
    } else {
      setLoading(false);
    }
  }, [isAdmin, adminUser]);

  const fetchTestModeStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('test_mode_override')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) throw error;
      setTestModeOverride(data?.test_mode_override ?? false);
    } catch (error) {
      console.error('Failed to fetch test mode status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ test_mode_override: checked })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      setTestModeOverride(checked);
      toast({
        title: checked ? 'Test mode enabled for you' : 'Test mode disabled for you',
        description: checked 
          ? 'Your payments will now use TEST mode while others use the global mode.'
          : 'Your payments will now use the global payment mode.',
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

  if (!isAdmin || loading) return null;

  return (
    <div className="space-y-2 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="admin-test-mode">Use Test Mode for My Payments</Label>
          <p className="text-sm text-muted-foreground">
            Enable TEST mode only for your payments without affecting regular users
          </p>
        </div>
        <Switch
          id="admin-test-mode"
          checked={testModeOverride}
          onCheckedChange={handleToggle}
        />
      </div>
      
      {testModeOverride && (
        <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded text-sm text-warning-foreground">
          ⚠️ Your payments are in TEST mode. Regular users are still using the global mode.
        </div>
      )}
    </div>
  );
};

export default AdminTestModeToggle;
