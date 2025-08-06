
import { auditLogger, AuditAction, SecurityRiskLevel } from './auditLogger';
import { rateLimiter, RATE_LIMITS } from './rateLimiter';

interface SuspiciousActivity {
  type: string;
  identifier: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  riskScore: number;
}

class SecurityMonitor {
  private suspiciousActivities: Map<string, SuspiciousActivity> = new Map();
  private readonly cleanupInterval: ReturnType<typeof setInterval>;
  private readonly riskThresholds = {
    LOW: 25,
    MEDIUM: 50,
    HIGH: 75,
    CRITICAL: 90
  };

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  async checkAuthenticationAttempt(email: string, userAgent?: string, ipAddress?: string): Promise<{ allowed: boolean; reason?: string }> {
    const identifier = this.createIdentifier('auth', email, ipAddress);
    
    // Check rate limiting first
    const rateCheck = rateLimiter.checkRateLimit(identifier, RATE_LIMITS.AUTH);
    if (!rateCheck.allowed) {
      await auditLogger.logRateLimitExceeded(identifier, 'authentication');
      await this.trackSuspiciousActivity('rate_limit_exceeded', identifier, 30);
      
      return { 
        allowed: false, 
        reason: 'Rate limit exceeded. Please try again later.' 
      };
    }

    // Check for suspicious patterns
    const riskScore = await this.calculateRiskScore('auth_attempt', email, userAgent, ipAddress);
    
    if (riskScore >= this.riskThresholds.HIGH) {
      await auditLogger.logSecurityEvent(AuditAction.SUSPICIOUS_ACTIVITY, {
        type: 'high_risk_auth_attempt',
        email,
        riskScore,
        userAgent,
        ipAddress
      });
      
      if (riskScore >= this.riskThresholds.CRITICAL) {
        return {
          allowed: false,
          reason: 'Account temporarily locked due to suspicious activity.'
        };
      }
    }

    return { allowed: true };
  }

  async checkPaymentAttempt(userId: string, amount: number, userAgent?: string, ipAddress?: string): Promise<{ allowed: boolean; reason?: string }> {
    const identifier = this.createIdentifier('payment', userId, ipAddress);
    
    // Check rate limiting
    const rateCheck = rateLimiter.checkRateLimit(identifier, RATE_LIMITS.PAYMENT);
    if (!rateCheck.allowed) {
      await auditLogger.logRateLimitExceeded(identifier, 'payment');
      return { 
        allowed: false, 
        reason: 'Too many payment attempts. Please wait before trying again.' 
      };
    }

    // Check for suspicious payment patterns
    const riskScore = await this.calculatePaymentRiskScore(userId, amount, userAgent, ipAddress);
    
    if (riskScore >= this.riskThresholds.HIGH) {
      await auditLogger.logSecurityEvent(AuditAction.SUSPICIOUS_ACTIVITY, {
        type: 'suspicious_payment_attempt',
        userId,
        amount,
        riskScore,
        userAgent,
        ipAddress
      });
      
      if (riskScore >= this.riskThresholds.CRITICAL) {
        return {
          allowed: false,
          reason: 'Payment blocked due to security concerns. Please contact support.'
        };
      }
    }

    return { allowed: true };
  }

  private async calculateRiskScore(
    activityType: string, 
    identifier: string, 
    userAgent?: string, 
    ipAddress?: string
  ): Promise<number> {
    let riskScore = 0;
    
    // Check for repeated failed attempts
    const failureKey = `${activityType}_failure_${identifier}`;
    const failureActivity = this.suspiciousActivities.get(failureKey);
    if (failureActivity) {
      riskScore += Math.min(failureActivity.count * 10, 40);
    }
    
    // Check for rapid successive attempts
    const rapidKey = `${activityType}_rapid_${identifier}`;
    const rapidActivity = this.suspiciousActivities.get(rapidKey);
    if (rapidActivity && rapidActivity.count > 3) {
      riskScore += 25;
    }
    
    // Check for suspicious user agent patterns
    if (userAgent) {
      if (this.isSuspiciousUserAgent(userAgent)) {
        riskScore += 20;
      }
    }
    
    // Check for known malicious IP patterns (simplified)
    if (ipAddress) {
      if (this.isSuspiciousIP(ipAddress)) {
        riskScore += 30;
      }
    }
    
    return Math.min(riskScore, 100);
  }

  private async calculatePaymentRiskScore(
    userId: string,
    amount: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<number> {
    let riskScore = await this.calculateRiskScore('payment', userId, userAgent, ipAddress);
    
    // Check for unusually high amounts
    if (amount > 500) {
      riskScore += 20;
    }
    
    if (amount > 1000) {
      riskScore += 30;
    }
    
    // Check for multiple payment attempts in short time
    const paymentKey = `payment_frequency_${userId}`;
    const paymentActivity = this.suspiciousActivities.get(paymentKey);
    if (paymentActivity && paymentActivity.count > 2) {
      riskScore += 25;
    }
    
    return Math.min(riskScore, 100);
  }

  private async trackSuspiciousActivity(
    type: string,
    identifier: string,
    riskIncrease: number
  ): Promise<void> {
    const key = `${type}_${identifier}`;
    const now = Date.now();
    
    let activity = this.suspiciousActivities.get(key);
    if (!activity) {
      activity = {
        type,
        identifier,
        count: 1,
        firstSeen: now,
        lastSeen: now,
        riskScore: riskIncrease
      };
    } else {
      activity.count++;
      activity.lastSeen = now;
      activity.riskScore = Math.min(activity.riskScore + riskIncrease, 100);
    }
    
    this.suspiciousActivities.set(key, activity);
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /^$/,
      /curl/i,
      /wget/i,
      /python/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private isSuspiciousIP(ipAddress: string): boolean {
    // Simplified suspicious IP detection
    // In production, you'd want to integrate with threat intelligence feeds
    const suspiciousPatterns = [
      /^10\./, // Private IP attempting external access
      /^192\.168\./, // Private IP attempting external access
      /^172\.(1[6-9]|2\d|3[01])\./ // Private IP range
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(ipAddress));
  }

  private createIdentifier(type: string, primary: string, secondary?: string): string {
    return secondary ? `${type}:${primary}:${secondary}` : `${type}:${primary}`;
  }

  private cleanup(): void {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [key, activity] of this.suspiciousActivities.entries()) {
      // Remove activities older than 1 hour
      if (now - activity.lastSeen > oneHour) {
        this.suspiciousActivities.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export const securityMonitor = new SecurityMonitor();
