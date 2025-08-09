
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WebhookEvent {
  event_type: string;
  processed_at: string;
  success: boolean;
  webhook_id: string;
}

interface WebhookStats {
  total_processed: number;
  successful: number;
  failed: number;
  recent_events: WebhookEvent[];
}

interface ProcessedWebhook {
  id: string;
  webhook_id: string;
  event_type: string;
  processed_at: string;
  success: boolean;
  created_at: string;
}

export const useWebhookMonitoring = () => {
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWebhookStats = async () => {
    try {
      // Get webhook processing statistics
      const { data: webhooks, error } = await supabase
        .from('processed_webhooks')
        .select('*')
        .order('processed_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      const typedWebhooks = webhooks as ProcessedWebhook[];
      const total_processed = typedWebhooks?.length || 0;
      const successful = typedWebhooks?.filter(w => w.success).length || 0;
      const failed = total_processed - successful;

      const recent_events: WebhookEvent[] = typedWebhooks?.slice(0, 10).map(w => ({
        event_type: w.event_type,
        processed_at: w.processed_at,
        success: w.success,
        webhook_id: w.webhook_id
      })) || [];

      setStats({
        total_processed,
        successful,
        failed,
        recent_events
      });
    } catch (error) {
      console.error('Error fetching webhook stats:', error);
      toast({
        title: "Error",
        description: "Failed to load webhook statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhookStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchWebhookStats
  };
};
