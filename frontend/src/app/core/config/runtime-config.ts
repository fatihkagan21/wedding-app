export interface WeddingAppRuntimeConfig {
  apiUrl?: string;
  photoUploadUrl?: string;
  memoryUploadMode?: string;
  memoryUploadOpenAt?: string;
}

declare global {
  interface Window {
    __WEDDING_APP_CONFIG__?: WeddingAppRuntimeConfig;
  }
}

export const runtimeConfig = window.__WEDDING_APP_CONFIG__ ?? {};
