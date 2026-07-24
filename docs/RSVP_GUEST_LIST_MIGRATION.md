# RSVP kayıtlarını davetli planına aktarma

Bu işlem, canlı veritabanındaki mevcut RSVP yanıtlarını `GuestListEntry` kayıtlarına dönüştürür.
Her oluşturulan kayıt kaynak RSVP'nin `rsvpId` değeriyle bağlanır. Script tekrar çalıştırıldığında
aynı RSVP için ikinci bir davetli kaydı oluşturulmaz.

## Aktarım kuralları

- Katılıyor yanıtı: `Geliyor`
- Katılmıyor yanıtı: `Gelmiyor`
- Davetiye durumu: `Gönderildi`
- Taraf: `Ortak`
- Planlanan kişi sayısı: Katılan RSVP'deki kişi sayısı; katılmayan yanıtta `1`
- RSVP notu ve katılımcı isimleri: Davetli kaydının not alanı

## Canlı ortamda kullanım

Önce yeni sürümü deploy edin ve deploy loglarında Prisma migration'larının başarıyla
uygulandığını doğrulayın. İşlemden önce veritabanı yedeği alın.

Render'da `wedding-api` servisinin **Shell** ekranını açın.

Önce yalnızca sonucu görmek için:

```bash
npm run migrate:rsvps-to-guest-list -- --dry-run
```

Çıktıdaki `Aktarılmayı bekleyen` sayısını kontrol ettikten sonra gerçek aktarımı çalıştırın:

```bash
npm run migrate:rsvps-to-guest-list
```

Yalnızca belirli bir etkinliği aktarmak için:

```bash
npm run migrate:rsvps-to-guest-list -- --dry-run --event-id=ETKINLIK_UUID
npm run migrate:rsvps-to-guest-list -- --event-id=ETKINLIK_UUID
```

Aktarımdan sonra `/admin` sayfasındaki **Davetli Planı** bölümünü yenileyin. Scripti yeniden
çalıştırmak güvenlidir; daha önce `rsvpId` ile bağlanan kayıtlar atlanır.

## Yerel ortamda kullanım

PostgreSQL çalışırken:

```powershell
cd backend
npm.cmd run build
npm.cmd run migrate:rsvps-to-guest-list -- --dry-run
npm.cmd run migrate:rsvps-to-guest-list
```

Komut, `DATABASE_URL` environment değişkenindeki veritabanını kullanır.
