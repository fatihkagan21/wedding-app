import { Request, Response } from "express";
import * as photoService from "./photo.service.js";

const SUCCESS_MESSAGE =
  "Anılarınız başarıyla yüklendi. Bu güzel anıları bizimle paylaştığınız için teşekkür ederiz 🤍";

export const uploadPhotos = async (req: Request, res: Response): Promise<void> => {
  const photos = req.files as Express.Multer.File[] | undefined;

  if (!photos?.length) {
    res.status(400).json({ error: "Lütfen en az bir fotoğraf, video veya ses dosyası seçin." });
    return;
  }

  try {
    await photoService.uploadPhotos(photos);
    res.status(200).json({ message: SUCCESS_MESSAGE });
  } catch (error) {
    console.error("Google Drive photo upload failed", error);
    res.status(500).json({
      error: "Dosyalar yüklenemedi. Lütfen daha sonra tekrar deneyin.",
    });
  }
};
