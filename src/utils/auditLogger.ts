
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText } from './sanitizer';

export enum AuditAction {
  // Authentication actions
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SIGNUP_ATTEMPT = 'SIGNUP_ATTEMPT',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  
  // Payment actions
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_VERIFICATION = 'PAYMENT_VERIFICATION',
  
  // Product actions
  PRODUCT_VIEW = 'PRODUCT_VIEW',
  PRODUCT_PURCHASE = 'PRODUCT_PURCHASE',
  
  // Security events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_BREACH_ATTEMPT = 'DATA_BREACH_ATTEMPT',
  ADMIN_ACTION = 'ADMIN_ACTION',
  
  // System events
  ERROR_OCCURRED = 'ERROR_OCCURRED',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE'
}

export enum SecurityRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface AuditLogEntry {
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  riskLevel?: SecurityRiskLevel;
  details?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

class AuditLogger {
  private pendingLogs: AuditLogEntry[] = [];
  private batchSize = 10;
  private batchTimeout = 5000; // 5 seconds
  private batchTimer: NodeJS.Timeout | null = null;

  async logEvent(entry: AuditLogEntry): Promise<void> {
    try {
      // Sanitize sensitive data
      const sanitizedEntry = this.sanitizeLogEntry(entry);
      
      // Add to pending batch
      this.pendingLogs.push(sanitizedEntry);
      
      // Process immediately for high-risk events
      if (entry.riskLevel === SecurityRiskLevel.HIGH || entry.riskLevel === SecurityRiskLevel.CRITICAL) {
        await this.processBatch();
        return;
      }
      
      // Batch process for lower-risk events
      if (this.pendingLogs.length >= this.batchSize) {
        await this.processBatch();
      } else {
        this.scheduleBatch();
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw to avoid breaking application flow
    }
  }

  private sanitizeLogEntry(entry: AuditLogEntry): AuditLogEntry {
    return {
      ...entry,
      resourceType: sanitizeText(entry.resourceType),
      resourceId: entry.resourceId ? sanitizeText(entry.resourceId) : undefined,
      details: entry.details ? this.sanitizeDetails(entry.details) : undefined,
      userAgent: entry.userAgent ? sanitizeText(entry.userAgent) : undefined,
      ipAddress: entry.ipAddress ? sanitizeText(entry.ipAddress) : undefined,
      sessionId: entry.sessionId ? sanitizeText(entry.sessionId) : undefined
    };
  }

  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(details)) {
      const sanitizedKey = sanitizeText(key);
      
      if (typeof value === 'string') {
        // Never log passwords, tokens, or other sensitive data
        if (this.isSensitiveField(key)) {
          sanitized[sanitizedKey] = '[REDACTED]';
        } else {
          sanitized[sanitizedKey] = sanitizeText(value);
        }
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this.sanitizeDetails(value);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }
    
    return sanitized;
  }

  private isSensitiveField(key: string): boolean {
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'ssn', 'social', 'credit', 'card', 'cvv', 'pin'
    ];
    
    const lowerKey = key.toLowerCase();
    return sensitiveFields.some(field => lowerKey.includes(field));
  }

  private scheduleBatch(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.batchTimeout);
  }

  private async processBatch(): Promise<void> {
    if (this.pendingLogs.length === 0) return;
    
    const logsToProcess = [...this.pendingLogs];
    this.pendingLogs = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    try {
      // Use the RPC function to log audit events
      for (const entry of logsToProcess) {
        await supabase.rpc('log_audit_event', {
          p_action: entry.action,
          p_resource_type: entry.resourceType,
          p_resource_id: entry.resourceId || null,
          p_details: entry.details || null
        });
      }
    } catch (error) {
      console.error('Failed to process audit log batch:', error);
      // Re-add to pending logs for retry (with limit to prevent infinite growth)
      if (this.pendingLogs.length < 100) {
        this.pendingLogs.unshift(...logsToProcess);
      }
    }
  }

  // Convenience methods for common audit events
  async logAuthAttempt(email: string, success: boolean, details?: Record<string, any>): Promise<void> {
    await this.logEvent({
      action: success ? AuditAction.LOGIN_SUCCESS : AuditAction.LOGIN_FAILED,
      resourceType: 'authentication',
      resourceId: email,
      riskLevel: success ? SecurityRiskLevel.LOW : SecurityRiskLevel.MEDIUM,
      details: {
        success,
        ...details
      }
    });
  }

  async logPaymentEvent(action: AuditAction, transactionId: string, amount: number, details?: Record<string, any>): Promise<void> {
    await this.logEvent({
      action,
      resourceType: 'payment',
      resourceId: transactionId,
      riskLevel: SecurityRiskLevel.MEDIUM,
      details: {
        amount,
        currency: 'GHS',
        ...details
      }
    });
  }

  async logSecurityEvent(action: AuditAction, details: Record<string, any>): Promise<void> {
    await this.logEvent({
      action,
      resourceType: 'security',
      riskLevel: SecurityRiskLevel.HIGH,
      details
    });
  }

  async logRateLimitExceeded(identifier: string, endpoint: string): Promise<void> {
    await this.logEvent({
      action: AuditAction.RATE_LIMIT_EXCEEDED,
      resourceType: 'rate_limit',
      resourceId: identifier,
      riskLevel: SecurityRiskLevel.MEDIUM,
      details: {
        endpoint,
        timestamp: new Date().toISOString()
      }
    });
  }
}

export const auditLogger = new AuditLogger();
