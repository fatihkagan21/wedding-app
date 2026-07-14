const localApiUrl = `${window.location.protocol}//${window.location.hostname}:3000`;

export const environment = {
    production: false,
    apiUrl: localApiUrl,
    photoUploadUrl: `${localApiUrl}/photos/upload`,
    memoryUpload: {
      mode: 'open',
      openAt: '2026-09-05T12:00:00+03:00'
    }
  };
