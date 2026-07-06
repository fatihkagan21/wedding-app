import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { uploadPhotoToDrive } from "./google-drive.service.js";

const extensionsByMimeType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
  "video/x-m4v": ".m4v",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/aac": ".aac",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/webm": ".webm",
  "audio/3gpp": ".3gp",
  "audio/amr": ".amr",
  "audio/flac": ".flac",
};

export const uploadPhotos = async (photos: Express.Multer.File[]): Promise<void> => {
  try {
    for (const photo of photos) {
      await uploadPhotoToDrive({
        path: photo.path,
        mimeType: photo.mimetype,
        name: `${randomUUID()}${extensionsByMimeType[photo.mimetype]}`,
      });
    }
  } finally {
    await Promise.allSettled(photos.map((photo) => unlink(photo.path)));
  }
};
