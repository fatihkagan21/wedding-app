import { createReadStream } from "node:fs";
import { google } from "googleapis";

export interface DrivePhoto {
  path: string;
  mimeType: string;
  name: string;
}

const getRequiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is missing`);
  }

  return value;
};

export const uploadPhotoToDrive = async (photo: DrivePhoto): Promise<void> => {
  const oauthClient = new google.auth.OAuth2(
    getRequiredEnvironmentVariable("GOOGLE_CLIENT_ID"),
    getRequiredEnvironmentVariable("GOOGLE_CLIENT_SECRET")
  );

  oauthClient.setCredentials({
    refresh_token: getRequiredEnvironmentVariable("GOOGLE_REFRESH_TOKEN"),
  });

  const drive = google.drive({ version: "v3", auth: oauthClient });

  await drive.files.create({
    uploadType: "resumable",
    requestBody: {
      name: photo.name,
      parents: [getRequiredEnvironmentVariable("GOOGLE_DRIVE_FOLDER_ID")],
    },
    media: {
      mimeType: photo.mimeType,
      body: createReadStream(photo.path),
    },
    fields: "id",
  });
};
