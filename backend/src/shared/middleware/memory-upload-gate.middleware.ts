import { NextFunction, Request, Response } from "express";

type MemoryUploadMode = "open" | "closed" | "scheduled";

const DEFAULT_OPEN_AT = "2026-09-05T12:00:00+03:00";

const getMode = (): MemoryUploadMode => {
  const mode = process.env.MEMORY_UPLOAD_MODE?.toLowerCase();
  if (mode === "open" || mode === "closed" || mode === "scheduled") return mode;
  return "open";
};

const getOpenAt = (): Date => {
  const configuredDate = process.env.MEMORY_UPLOAD_OPEN_AT || DEFAULT_OPEN_AT;
  const openAt = new Date(configuredDate);
  return Number.isNaN(openAt.getTime()) ? new Date(DEFAULT_OPEN_AT) : openAt;
};

export const requireMemoryUploadOpen = (_req: Request, res: Response, next: NextFunction) => {
  const mode = getMode();

  if (mode === "open") {
    return next();
  }

  if (mode === "closed") {
    return res.status(403).json({
      error: "Anı yükleme şu anda kapalı.",
      mode,
    });
  }

  const openAt = getOpenAt();
  const now = new Date();

  if (now >= openAt) {
    return next();
  }

  return res.status(403).json({
    error: "Anı yükleme düğün günü nikah öncesi açılacak.",
    mode,
    openAt: openAt.toISOString(),
  });
};
