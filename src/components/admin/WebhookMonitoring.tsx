
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebhookMonitoring } from '@/hooks/useWebhookMonitoring';
import { formatDistanceToNow } from 'date-fns';

const WebhookMonitoring = () => {
  const { stats, loading, refetch } = useWebhookMonitoring();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading webhook statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No webhook data available</p>
      </div>
    );
  }

  const successRate = stats.total_processed > 0 
    ? (stats.successful / stats.total_processed * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Webhook Monitoring</h2>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-bullion-purple text-white rounded hover:bg-bullion-purple/90"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_processed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Events</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recent_events.length === 0 ? (
            <p className="text-gray-500">No recent webhook events</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_events.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={event.success ? "default" : "destructive"}>
                      {event.event_type}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      ID: {event.webhook_id}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(event.processed_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookMonitoring;
