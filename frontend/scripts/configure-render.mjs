import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiUrl = normalizeUrl(
  process.env.API_URL
    ?? (process.env.API_HOST ? `https://${process.env.API_HOST}` : '')
);

if (!apiUrl) {
  throw new Error('API_HOST or API_URL is required for the Render static-site build');
}

const config = {
  apiUrl,
  photoUploadUrl: `${apiUrl}/photos/upload`,
  memoryUploadMode: process.env.MEMORY_UPLOAD_MODE ?? 'scheduled',
  memoryUploadOpenAt: process.env.MEMORY_UPLOAD_OPEN_AT ?? '2026-09-05T20:00:00+03:00'
};

const outputDirectory = resolve('dist/frontend/browser');
const outputPath = resolve(outputDirectory, 'runtime-config.js');
const contents = `window.__WEDDING_APP_CONFIG__ = ${JSON.stringify(config, null, 2)};\n`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, contents, 'utf8');
console.log(`Render runtime config written to ${outputPath}`);

function normalizeUrl(value) {
  return value.trim().replace(/\/$/, '');
}
