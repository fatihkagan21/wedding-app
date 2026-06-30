import { timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const configuredKey = process.env.ADMIN_API_KEY;
  const suppliedKey = req.header("x-admin-key");

  if (!configuredKey) {
    return res.status(503).json({ error: "Admin access is not configured" });
  }

  if (!suppliedKey) {
    return res.status(401).json({ error: "Admin key is required" });
  }

  const expected = Buffer.from(configuredKey);
  const actual = Buffer.from(suppliedKey);
  const isValid = expected.length === actual.length && timingSafeEqual(expected, actual);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid admin key" });
  }

  return next();
};
