/**
 * Security Utilities
 * 
 * Provides input sanitization, validation, and security headers
 */

/**
 * Security headers to add to all responses
 */
export const securityHeaders = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Content Security Policy (adjust as needed)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
};

/**
 * Add security headers to a response
 */
export function addSecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  return newResponse;
}

/**
 * Sanitize string input to prevent injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except newlines and tabs for descriptions)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize object to prevent NoSQL injection
 * Removes any keys starting with $ or containing .
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip dangerous keys (MongoDB operators)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    
    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return sanitizeObject(item as Record<string, unknown>);
        }
        return item;
      }) as T[keyof T];
    } else if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Check if request looks like a bot (basic check)
 */
export function isSuspiciousBot(request: Request): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // Allow legitimate bots (search engines, etc.)
  const legitimateBots = [
    'googlebot',
    'bingbot',
    'slackbot',
    'twitterbot',
    'facebookexternalhit',
  ];
  
  if (legitimateBots.some((bot) => userAgent.includes(bot))) {
    return false;
  }
  
  // Suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /ruby/i,
    /java(?!script)/i, // Java but not JavaScript
    /go-http-client/i,
    /axios/i,
    /node-fetch/i,
  ];
  
  // Empty user agent is suspicious
  if (!userAgent) {
    return true;
  }
  
  return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Validate request has required headers
 */
export function hasRequiredHeaders(request: Request): boolean {
  // Check for basic required headers that browsers send
  const hasUserAgent = request.headers.has('user-agent');
  const hasAccept = request.headers.has('accept');
  
  return hasUserAgent && hasAccept;
}

/**
 * Check request body size (in bytes)
 */
export async function validateRequestSize(
  request: Request,
  maxSizeBytes: number
): Promise<{ valid: boolean; error?: string }> {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > maxSizeBytes) {
      return {
        valid: false,
        error: `Request body too large. Maximum size: ${Math.round(maxSizeBytes / 1024)}KB`,
      };
    }
  }
  
  return { valid: true };
}

/**
 * Validate JSON payload structure
 */
export async function parseAndValidateJson<T>(
  request: Request,
  maxSizeBytes: number = 1024 * 1024 // 1MB default
): Promise<{ success: boolean; data?: T; error?: string }> {
  // Check size first
  const sizeCheck = await validateRequestSize(request, maxSizeBytes);
  if (!sizeCheck.valid) {
    return { success: false, error: sizeCheck.error };
  }
  
  try {
    const data = await request.json();
    
    // Sanitize the parsed data
    const sanitized = sanitizeObject(data as Record<string, unknown>);
    
    return { success: true, data: sanitized as T };
  } catch (error) {
    return { success: false, error: 'Invalid JSON payload' };
  }
}

/**
 * Comprehensive security check for requests
 */
export function performSecurityCheck(request: Request): {
  passed: boolean;
  reason?: string;
} {
  // Check for required headers
  if (!hasRequiredHeaders(request)) {
    return { passed: false, reason: 'Missing required headers' };
  }
  
  // Check for suspicious bots (only for POST/PUT/DELETE)
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    if (isSuspiciousBot(request)) {
      return { passed: false, reason: 'Suspicious user agent detected' };
    }
  }
  
  return { passed: true };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  additionalData?: Record<string, unknown>
): Response {
  const response = new Response(
    JSON.stringify({
      error: message,
      ...additionalData,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  return addSecurityHeaders(response);
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(
  data: unknown,
  status: number = 200
): Response {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return addSecurityHeaders(response);
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitize search parameters to prevent injection
 */
export function sanitizeSearchParams(searchParams: URLSearchParams): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    // Skip dangerous keys
    if (key.startsWith('$') || key.includes('.')) {
      return;
    }
    
    sanitized[key] = sanitizeString(value);
  });
  
  return sanitized;
}

