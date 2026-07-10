import { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  message: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

export const getRateLimitConfig = (prefix: string, defaults: Omit<RateLimitOptions, "message">) => {
  return {
    windowMs: parsePositiveInteger(process.env[`${prefix}_WINDOW_MS`], defaults.windowMs),
    maxRequests: parsePositiveInteger(process.env[`${prefix}_MAX_REQUESTS`], defaults.maxRequests),
  };
};

export const createRateLimit = (options: RateLimitOptions) => {
  const requests = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const forwardedFor = req.get("x-forwarded-for")?.split(",")[0]?.trim();
    const key = forwardedFor || req.ip || req.socket.remoteAddress || "unknown";
    const current = requests.get(key);

    if (!current || current.resetAt <= now) {
      requests.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      return next();
    }

    if (current.count >= options.maxRequests) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);

      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        error: options.message,
        retryAfterSeconds,
      });
    }

    current.count += 1;
    return next();
  };
};
