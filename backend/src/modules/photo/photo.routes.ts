import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { Request, Router } from "express";
import multer from "multer";
import * as controller from "./photo.controller.js";

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);
const mimeTypesByExtension: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  m4v: "video/x-m4v",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: tmpdir(),
    filename: (_req, _file, callback) => callback(null, randomUUID()),
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    const extension = file.originalname.split(".").pop()?.toLowerCase() ?? "";
    const normalizedMimeType = allowedMimeTypes.has(file.mimetype)
      ? file.mimetype
      : mimeTypesByExtension[extension];

    if (!normalizedMimeType) {
      console.warn("Unsupported upload file type", {
        originalName: file.originalname,
        mimeType: file.mimetype || "unknown",
      });
      callback(new Error("INVALID_FILE_TYPE"));
      return;
    }

    file.mimetype = normalizedMimeType;
    callback(null, true);
  },
});

const removeTemporaryFiles = async (req: Request): Promise<void> => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  await Promise.allSettled(files.map((file) => unlink(file.path)));
};

const router = Router();

router.post("/upload", (req, res) => {
  const requestId = randomUUID();
  const startedAt = Date.now();
  res.setHeader("X-Request-ID", requestId);

  console.info("Photo upload request received", {
    requestId,
    contentLength: req.get("content-length") ?? "unknown",
    contentType: req.get("content-type") ?? "unknown",
  });

  res.on("finish", () => {
    console.info("Photo upload request completed", {
      requestId,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  upload.array("photos")(req, res, async (error) => {
    if (error) {
      await removeTemporaryFiles(req);

      console.warn("Photo upload request rejected", {
        requestId,
        code: error instanceof multer.MulterError ? error.code : error.message,
      });

      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "Her dosya en fazla 500 MB olabilir." });
        return;
      }

      if (error instanceof multer.MulterError && error.code === "LIMIT_UNEXPECTED_FILE") {
        res.status(400).json({ error: "Dosyalar 'photos' alanıyla gönderilmelidir." });
        return;
      }

      if (error instanceof Error && error.message === "INVALID_FILE_TYPE") {
        res.status(400).json({
          error: "Sadece JPEG, PNG, WebP, HEIC, HEIF, MP4, MOV, WebM veya M4V dosyaları yükleyebilirsiniz.",
        });
        return;
      }

      console.error("Photo upload request failed", error);
      res.status(500).json({ error: "Beklenmeyen bir hata oluştu." });
      return;
    }

    await controller.uploadPhotos(req, res);
  });
});

export default router;
