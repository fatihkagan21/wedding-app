# Render: Web Service + Static Site deployment

Bu yapılandırma aynı repodan üç ayrı Render kaynağı yayınlar:

- `wedding-api`: Docker tabanlı Web Service
- `wedding-web`: Angular build çıktısını sunan Static Site
- `wedding-demo`: `feature/demo-site` branch'inden yayınlanan bağımsız Static Site

Frontend, Blueprint içindeki servis referansı sayesinde backend'in yeni workspace'te oluşan
`onrender.com` hostname'ini build sırasında otomatik alır. API URL'sini elle kaynak koda
yazmak gerekmez. `/admin` dahil Angular rotalarının doğrudan açılabilmesi için tüm bilinmeyen
yollar `index.html` dosyasına rewrite edilir.

## 1. Branch'i uzak repoya gönderme

Değişiklikler `feat/render-split-services` branch'indedir. Önce branch'i uzak repoya gönderin:

```powershell
git push -u origin feat/render-split-services
```

İsterseniz bu branch ile geçici kurulum yapabilir veya PR'ı birleştirdikten sonra Render'da
repo'nun varsayılan branch'ini kullanabilirsiniz. `render.yaml` içinde özellikle bir `branch`
alanı yoktur; Blueprint'i hangi branch'ten oluşturursanız ilk kurulumda o branch'i seçin.

## 2. Yeni workspace'te Blueprint oluşturma

1. Render'da yeni workspace'e geçin.
2. **New > Blueprint** seçin.
3. GitHub/GitLab reposunu bağlayın.
4. Branch olarak `feat/render-split-services` (veya merge sonrası varsayılan branch), Blueprint
   path olarak `render.yaml` seçin.
5. Render'ın göstereceği iki kaynağı onaylayın.
6. `sync: false` olan aşağıdaki değerleri ilk oluşturma ekranında girin:

   - `DATABASE_URL`: Neon pooled connection string
   - `DIRECT_URL`: Neon direct connection string
   - `ADMIN_API_KEY`: uzun, rastgele admin anahtarı
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `GOOGLE_DRIVE_FOLDER_ID`

`API_HOST`, `FRONTEND_HOST`, `MEMORY_UPLOAD_MODE` ve `MEMORY_UPLOAD_OPEN_AT` Blueprint tarafından ayarlanır.
Frontend build'i `API_HOST` değerinden hem normal API adresini hem fotoğraf yükleme adresini
üretir. `FRONTEND_HOST`, custom domain taşınmadan önce Static Site'ın `onrender.com` adresinden
yapılan isteklerin de CORS tarafından kabul edilmesini sağlar. Secret değerleri Git'e eklemeyin.

## 3. İlk deploy'u kontrol etme

Önce Render'ın verdiği adreslerle kontrol edin:

1. `https://<wedding-api-host>/health` yanıtı `{"status":"ok"}` olmalı.
2. `https://<wedding-web-host>` açılmalı.
3. Bir davetiye sayfası, RSVP isteği, `/admin` ve fotoğraf yükleme akışı kontrol edilmeli.
4. Tarayıcının Network panelindeki API istekleri yeni `wedding-api` adresine gitmeli.

Backend free instance kullanırsa uyku sonrası ilk istek gecikebilir. Bu gecikme istenmiyorsa
`wedding-api` için Render panelinden ücretli instance seçin. Static Site CDN üzerinden sunulur.

## 4. `www.ozgefatihdugun.tr` domain'ini taşıma

Blueprint'in canonical domain'i `www.ozgefatihdugun.tr` olarak ayarlanmıştır. Render ayrıca kök
domaini (`ozgefatihdugun.tr`) ekler ve `www` adresine yönlendirir.

Domain halen eski workspace'teki `wedding-web` servisine bağlıysa önce yeni servisleri
`onrender.com` adresleriyle doğrulayın. Geçiş anında:

1. Eski Render servisinin **Settings > Custom Domains** bölümünden domaini kaldırın.
2. Yeni workspace'teki `wedding-web` Static Site üzerinde Blueprint'i tekrar **Sync** edin
   veya domaini **Custom Domains** bölümünden ekleyin.
3. DNS sağlayıcısında `www` CNAME kaydını yeni Static Site'ın `onrender.com` hostname'ine çevirin.
4. Kök domain kaydını Render'ın panelde gösterdiği talimata göre güncelleyin.
5. Render'da **Verify** çalıştırın ve TLS sertifikasının hazır olmasını bekleyin.

Aynı custom domain aynı anda eski ve yeni serviste kullanılamayacağı için kısa bir geçiş aralığı
oluşabilir. DNS TTL değerini geçişten önce düşürmek bu süreyi azaltır. Render kullanıyorsanız
uyumsuz `AAAA` kayıtlarını kaldırın.

## 5. Deploy sonrası doğrulama

- `https://www.ozgefatihdugun.tr` Static Site'ı açıyor.
- `https://ozgefatihdugun.tr` adresi `www` adresine yönleniyor.
- Sayfayı `/admin` gibi bir Angular rotasında yenilemek 404 üretmiyor.
- API çağrılarında CORS hatası yok.
- Backend loglarında migration ve idempotent seed başarılı.
- Eski workspace kaynakları ancak tüm kontroller tamamlandıktan sonra kapatılıyor.

## 6. Demo Static Site

Blueprint aynı workspace içinde `wedding-demo` adlı üçüncü bir kaynak oluşturur. Bu servis:

- Kaynak olarak `feature/demo-site` branch'ini izler.
- Yalnızca `frontend` klasörünü build eder.
- Backend ve veritabanı bağlantısı kullanmaz.
- Custom domain kullanmadan Render'ın verdiği `wedding-demo` `onrender.com` adresinde yayınlanır.
- `feature/demo-site` branch'ine gönderilen her yeni commit sonrasında otomatik deploy edilir.

Blueprint ilk kez sync edildiğinde değişiklik listesinde `wedding-demo` Static Site kaynağının da
göründüğünü kontrol edin. Demo için environment variable veya secret girmeniz gerekmez.
