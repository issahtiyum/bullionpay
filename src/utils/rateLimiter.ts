
interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs?: number;
}

interface RateLimitAttempt {
  timestamp: number;
  count: number;
  blocked?: boolean;
  blockExpiry?: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitAttempt> = new Map();
  private readonly cleanupInterval: number;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  checkRateLimit(identifier: string, config: RateLimitConfig): { allowed: boolean; resetTime?: number; remaining?: number } {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    let attempt = this.attempts.get(identifier);
    
    // Check if currently blocked
    if (attempt?.blocked && attempt.blockExpiry && now < attempt.blockExpiry) {
      return { 
        allowed: false, 
        resetTime: attempt.blockExpiry 
      };
    }
    
    // Reset if window has passed or if block has expired
    if (!attempt || attempt.timestamp < windowStart || (attempt.blocked && attempt.blockExpiry && now >= attempt.blockExpiry)) {
      attempt = {
        timestamp: now,
        count: 1,
        blocked: false
      };
    } else {
      attempt.count++;
      attempt.timestamp = now;
    }
    
    // Check if exceeded rate limit
    if (attempt.count > config.maxAttempts) {
      attempt.blocked = true;
      attempt.blockExpiry = now + (config.blockDurationMs || config.windowMs);
      this.attempts.set(identifier, attempt);
      
      return { 
        allowed: false, 
        resetTime: attempt.blockExpiry 
      };
    }
    
    this.attempts.set(identifier, attempt);
    
    return {
      allowed: true,
      remaining: config.maxAttempts - attempt.count
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, attempt] of this.attempts.entries()) {
      // Remove expired entries
      if (attempt.blockExpiry && now > attempt.blockExpiry) {
        this.attempts.delete(key);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDurationMs: 30 * 60 * 1000 // 30 minutes block
  },
  PAYMENT: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 3,
    blockDurationMs: 5 * 60 * 1000 // 5 minutes block
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDurationMs: 60 * 60 * 1000 // 1 hour block
  }
} as const;
