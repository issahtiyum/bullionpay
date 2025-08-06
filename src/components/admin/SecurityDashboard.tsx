
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Activity, Eye, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  created_at: string;
  user_id: string;
}

const SecurityDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    suspiciousActivities: 0,
    rateLimitExceeded: 0,
    failedLogins: 0
  });
  const { toast } = useToast();

  const fetchSecurityEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .in('action', [
          'SUSPICIOUS_ACTIVITY',
          'RATE_LIMIT_EXCEEDED', 
          'LOGIN_FAILED',
          'PAYMENT_FAILED',
          'DATA_BREACH_ATTEMPT'
        ])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setEvents(data || []);
      
      // Calculate stats
      const totalEvents = data?.length || 0;
      const suspiciousActivities = data?.filter(e => e.action === 'SUSPICIOUS_ACTIVITY').length || 0;
      const rateLimitExceeded = data?.filter(e => e.action === 'RATE_LIMIT_EXCEEDED').length || 0;
      const failedLogins = data?.filter(e => e.action === 'LOGIN_FAILED').length || 0;
      
      setStats({
        totalEvents,
        suspiciousActivities,
        rateLimitExceeded,
        failedLogins
      });

    } catch (error: any) {
      console.error('Error fetching security events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch security events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecurityEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (action: string) => {
    switch (action) {
      case 'SUSPICIOUS_ACTIVITY':
      case 'DATA_BREACH_ATTEMPT':
        return <Badge variant="destructive" className="text-xs">Critical</Badge>;
      case 'PAYMENT_FAILED':
      case 'RATE_LIMIT_EXCEEDED':
        return <Badge variant="secondary" className="text-xs">High</Badge>;
      case 'LOGIN_FAILED':
        return <Badge variant="outline" className="text-xs">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Low</Badge>;
    }
  };

  const formatEventDetails = (details: any) => {
    if (!details) return 'No details available';
    
    const sanitizedDetails = { ...details };
    
    // Remove sensitive information
    delete sanitizedDetails.password;
    delete sanitizedDetails.token;
    delete sanitizedDetails.key;
    
    return JSON.stringify(sanitizedDetails, null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor security events and system health</p>
        </div>
        <Button onClick={fetchSecurityEvents} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Last 50 security events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits Hit</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.rateLimitExceeded}</div>
            <p className="text-xs text-muted-foreground">Blocked requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Eye className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">Authentication failures</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Real-time monitoring of security-related activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading security events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No security events found
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSeverityBadge(event.action)}
                      <span className="font-medium">{event.action.replace('_', ' ')}</span>
                      <span className="text-sm text-muted-foreground">
                        {event.resource_type}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  {event.resource_id && (
                    <div className="text-sm">
                      <strong>Resource ID:</strong> {event.resource_id}
                    </div>
                  )}
                  
                  {event.details && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                        {formatEventDetails(event.details)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
