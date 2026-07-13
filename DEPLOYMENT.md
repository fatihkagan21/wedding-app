# Deployment

Render'da backend'i Web Service, frontend'i Static Site olarak yeni bir workspace'e kurmak için
[RENDER_SPLIT_DEPLOYMENT.md](./RENDER_SPLIT_DEPLOYMENT.md) rehberini kullanın.

## Development

```powershell
docker compose -f docker-compose.dev.yml up --build
```

- Uygulama: `http://localhost:4200`
- API: `http://localhost:3000`
- Admin: `http://localhost:4200/admin`
- Yerel admin anahtarı: `local-admin-key`

Prisma Studio yalnızca ihtiyaç olduğunda tools profiliyle çalışır:

```powershell
docker compose -f docker-compose.dev.yml --profile tools up prisma-studio
```

Studio adresi: `http://localhost:5555`

## Production: Docker Compose

1. Örnek environment dosyasını kopyalayın:

```powershell
Copy-Item .env.production.example .env.production
```

2. `.env.production` içindeki iki parolayı uzun ve birbirinden farklı değerlerle değiştirin. `DATABASE_URL` içindeki kullanıcı/parola, PostgreSQL değerleriyle aynı olmalıdır.

3. Yapılandırmayı doğrulayın:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml config
```

4. Production servislerini başlatın:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

`migrate` servisi veritabanı migration'larını bir kez uygular. Başarılı olunca backend, ardından frontend açılır. PostgreSQL ve backend doğrudan internete port açmaz; dışarıya yalnızca Nginx çıkar. Render başlangıç komutu migration sonrasında sabit davetiye kaydını yalnızca eksikse oluşturur; mevcut davetiye verisini ezmez.

5. Durumu ve logları kontrol edin:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f backend frontend
```

6. Yeni sürüm yayınlarken kodu güncelleyin ve 4. adımdaki `up -d --build` komutunu tekrar çalıştırın.

## Domain ve HTTPS

Compose kurulumu için bir Linux makinede Docker Engine gerekir. Domain'in A kaydını makinenin IP adresine yönlendirin. Uygulamanın önüne Caddy, Traefik veya sağlayıcının HTTPS proxy'sini koyun; yalnızca `80/443` portlarını açın. `.env.production` dosyasını repoya eklemeyin ve PostgreSQL volume'unu düzenli yedekleyin.

## Sunucu Kiralamadan

Docker, tek başına barındırma hizmeti değildir; container'ı çalıştıracak bir bilgisayar yine gerekir. VPS yönetmek istemiyorsanız container destekleyen bir platforma backend Dockerfile'ını, frontend'i ise statik site veya container olarak deploy edebilir; PostgreSQL'i yönetilen veritabanı hizmetinden alabilirsiniz.

### Render ile önerilen akış

Repo kökündeki `render.yaml`, frontend ve backend servislerini tanımlar. PostgreSQL Neon tarafından sağlanır.

1. Projeyi GitHub veya GitLab'e gönderin.
2. Render hesabında **New > Blueprint** seçin.
3. Repoyu bağlayıp kökteki `render.yaml` dosyasını seçin.
4. Neon panelinden pooled ve direct connection string değerlerini alın.
5. İstendiğinde `DATABASE_URL` alanına Neon pooled, `DIRECT_URL` alanına Neon direct connection string değerini girin.
6. `ADMIN_API_KEY` için uzun ve rastgele bir değer girin.
7. Oluşturulacak `wedding-web` ve `wedding-api` kaynaklarını onaylayın.
8. Deploy bitince `wedding-web` servisinin verdiği adresten uygulamayı açın.
9. `/admin` ekranına 6. adımda belirlediğiniz anahtarla girin.
10. Domain kullanacaksanız `wedding-web` servisine Custom Domain olarak ekleyin. API Nginx üzerinden çağrıldığı için ayrıca API domain'i tanımlamanız gerekmez.

Blueprint web servislerinde başlangıç kolaylığı için free plan tanımlar. Backend uyku/gecikmesi istemiyorsanız `wedding-api` servisini Render panelinden ücretli instance'a yükseltin. Neon bağlantıları yalnızca Render Environment/Secrets alanında tutulmalıdır.

Servisleri ayrı yayınlarken frontend image'ını gerçek API adresiyle oluşturun:

```powershell
docker build -f frontend/Dockerfile.prod --build-arg API_URL=https://api.example.com -t wedding-frontend ./frontend
```

Bu modelde backend `cors` ayarı yalnızca frontend domain'ine sınırlandırılmalıdır. Aynı makinedeki Compose modelinde varsayılan `/api` proxy'si daha sade ve güvenlidir.
