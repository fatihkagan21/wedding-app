# Fotoğraf yükleme kurulumu

Bu özellik `POST /photos/upload` üzerinden gelen fotoğrafları kişisel Google Drive hesabındaki özel bir klasöre yükler. Veritabanına kayıt atmaz, istemciye Drive dosya kimliği veya bağlantısı dönmez.

Backend paketleri:

```powershell
npm install multer googleapis
npm install --save-dev @types/multer
```

## Google Cloud ve OAuth2

1. [Google Cloud Console](https://console.cloud.google.com/) içinde bir proje oluşturun veya mevcut projeyi seçin.
2. **APIs & Services > Library** bölümünden **Google Drive API**'yi etkinleştirin.
3. **OAuth consent screen** bölümünde uygulamayı `External` olarak yapılandırın ve kendi Gmail adresinizi test kullanıcısı olarak ekleyin.
4. **Credentials > Create credentials > OAuth client ID** yolundan `Web application` istemcisi oluşturun.
5. İzin verilen yönlendirme URI'larına `https://developers.google.com/oauthplayground` ekleyin.
6. Drive'da yalnızca bu yüklemeler için özel bir klasör oluşturun. Klasörü public yapmayın. Klasör URL'sindeki `/folders/` sonrasındaki değer `GOOGLE_DRIVE_FOLDER_ID` değeridir.

### Refresh token alma

Bir defalık kurulum için [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) kullanılabilir:

1. Sağ üstteki ayarlardan **Use your own OAuth credentials** seçeneğini açın; Web client ID ve secret değerlerini girin.
2. Sol listede `Drive API v3` altından `https://www.googleapis.com/auth/drive` kapsamını seçin ve **Authorize APIs** düğmesine basın.
3. Fotoğrafların sahibi olacak Google hesabıyla giriş yapıp izni onaylayın.
4. **Exchange authorization code for tokens** düğmesine basın ve üretilen refresh token'ı bir kez kopyalayın.

Kişisel Gmail hesabında consent screen `Testing` durumunda kalırsa refresh token 7 gün sonra sona erer. Tek kullanıcılı bu uygulamada yayın durumunu `In production` yapın. Google, 100 kullanıcıdan az kişisel kullanım uygulamalarında doğrulamayı zorunlu tutmaz; kendi bir defalık OAuth onayınızda doğrulanmamış uygulama uyarısı görebilirsiniz. Token'ı repoya veya frontend'e koymayın.

## Environment variables

Backend için gereken dört secret:

```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_DRIVE_FOLDER_ID=...
```

Bu çözüm service account kullanmaz; `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` ve credential JSON dosyası gerekli değildir.

Render'da `wedding-api > Environment` bölümüne dört değeri ekleyin ve backend'i yeniden deploy edin. `render.yaml` alanları secret (`sync: false`) olarak tanımlar. Frontend servisine bu değerleri eklemeyin.

Yerel çalıştırmada aynı değerleri git tarafından yok sayılan `backend/.env` dosyasına ekleyin. Docker Compose production kullanıyorsanız `.env.production` dosyasına ekleyin.

## Manuel test listesi

- [ ] Tek bir JPEG seçildiğinde seçilen dosya sayısı `1` görünüyor.
- [ ] Birden fazla geçerli fotoğraf tek istekte yükleniyor.
- [ ] PNG, WebP, HEIC ve HEIF dosyaları kabul ediliyor.
- [ ] Video seçimi frontend'de reddediliyor; API'ye doğrudan gönderilirse `400` dönüyor.
- [ ] 100 MB üstündeki tek bir dosya frontend'de reddediliyor; API'ye doğrudan gönderilirse `400` dönüyor.
- [ ] Dosyasız istek `400` dönüyor.
- [ ] Yükleme sırasında buton pasif ve `Yükleniyor...` yazıyor.
- [ ] Başarılı yüklemeden sonra seçim temizleniyor ve teşekkür mesajı görünüyor.
- [ ] Dosya özel Drive klasöründe UUID adıyla bulunuyor.
- [ ] API cevabında Drive linki, klasör bilgisi veya file ID bulunmuyor.
- [ ] Hatalı Drive credential ile `500` ve Türkçe genel hata dönüyor.
- [ ] Event, RSVP ve admin ekranlarının mevcut akışları çalışmaya devam ediyor.
