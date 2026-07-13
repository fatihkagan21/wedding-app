export const environment = {
    production: true,
    apiUrl: '/api',
    // Büyük yüklemeleri Cloudflare'ın istek boyutu sınırına takılmadan API'ye iletir.
    photoUploadUrl: 'https://wedding-api-mzi5.onrender.com/photos/upload',
    memoryUpload: {
      mode: 'scheduled',
      openAt: '2026-09-05T17:00:00+03:00'
    }
  };
