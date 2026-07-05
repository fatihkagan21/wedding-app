import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { Request, Router } from "express";
import multer from "multer";
import * as controller from "./photo.controller.js";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: tmpdir(),
    filename: (_req, _file, callback) => callback(null, randomUUID()),
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error("INVALID_FILE_TYPE"));
      return;
    }

    callback(null, true);
  },
});

const removeTemporaryFiles = async (req: Request): Promise<void> => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  await Promise.allSettled(files.map((file) => unlink(file.path)));
};

const router = Router();

router.post("/upload", (req, res) => {
  upload.array("photos")(req, res, async (error) => {
    if (error) {
      await removeTemporaryFiles(req);

      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "Her fotoğraf en fazla 100 MB olabilir." });
        return;
      }

      if (error instanceof multer.MulterError && error.code === "LIMIT_UNEXPECTED_FILE") {
        res.status(400).json({ error: "Dosyalar 'photos' alanıyla gönderilmelidir." });
        return;
      }

      if (error instanceof Error && error.message === "INVALID_FILE_TYPE") {
        res.status(400).json({
          error: "Sadece JPEG, PNG, WebP, HEIC veya HEIF fotoğrafları yükleyebilirsiniz.",
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
