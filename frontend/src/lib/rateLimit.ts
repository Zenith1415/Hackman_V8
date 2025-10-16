/**
 * Rate Limiting Middleware
 * 
 * This implements IP-based rate limiting to prevent DDoS attacks and abuse.
 * It uses an in-memory store with automatic cleanup of old entries.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

/**
 * Default rate limit configurations for different route types
 */
export const rateLimitConfigs = {
  // Public routes - stricter limits
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 registrations per hour per IP
    message: 'Too many registration attempts. Please try again later.',
  },
  contact: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3, // 3 contact form submissions per 15 minutes
    message: 'Too many contact form submissions. Please try again later.',
  },
  teamAccess: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 30, // 30 requests per 15 minutes (dashboard access)
    message: 'Too many requests. Please try again later.',
  },
  teamSubmission: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 submission attempts per hour
    message: 'Too many submission attempts. Please try again later.',
  },
  // Admin routes - moderate limits
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many admin requests. Please try again later.',
  },
  adminAnalysis: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 AI analysis requests per hour (expensive operation)
    message: 'Too many analysis requests. Please try again later.',
  },
};

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check various headers for the real IP (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  
  // Fallback - this should rarely happen in production
  return 'unknown';
}

/**
 * Check if a request should be rate limited
 * Returns null if allowed, or an error response if rate limited
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIp(request);
  const now = Date.now();
  
  // Create a unique key for this IP and rate limit config
  const key = `${ip}:${config.windowMs}:${config.maxRequests}`;
  
  let entry = rateLimitStore[key];
  
  // Initialize or reset if window has passed
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      firstRequest: now,
    };
    rateLimitStore[key] = entry;
  }
  
  // Increment request count
  entry.count++;
  
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware wrapper
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: Request): Response | null => {
    const result = checkRateLimit(request, config);
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      return new Response(
        JSON.stringify({
          error: config.message || 'Too many requests',
          retryAfter: retryAfter,
          resetTime: new Date(result.resetTime).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }
    
    return null; // Allow the request
  };
}

/**
 * Get rate limit info for a request (for informational purposes)
 */
export function getRateLimitInfo(request: Request, config: RateLimitConfig) {
  const ip = getClientIp(request);
  const key = `${ip}:${config.windowMs}:${config.maxRequests}`;
  const entry = rateLimitStore[key];
  
  if (!entry) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowMs,
    };
  }
  
  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    reset: entry.resetTime,
  };
}

