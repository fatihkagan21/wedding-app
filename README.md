# Wedding App

## Tech Stack

Frontend
- Angular

Backend
- Node.js
- Express

Database
- PostgreSQL

ORM
- Prisma

Deployment
- Netlify
- Render
- Neon

## Docker ile geliştirme

Bu proje Docker'a uygundur. `docker-compose.yml` artık PostgreSQL, backend ve frontend servislerini birlikte çalıştırır.

```bash
docker compose up --build
```

Servisler:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

## RSVP bildirimini local test etme

Gmail uygulama parolasini `backend/.env` dosyasinda `SMTP_PASS` olarak kullanin. Google parolayi bosluklu gosterirse bosluklari kaldirin.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=senin@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=senin@gmail.com
RSVP_NOTIFICATION_EMAIL=senin@gmail.com
```

Ardindan backend'i yeniden baslatin:

```bash
cd backend
npm.cmd run dev
```

Frontend'den bir katilim bildirimi gonderin ve Gmail gelen kutunuzu kontrol edin. Mail gelmezse Spam klasorunu ve backend terminalindeki `Failed to send RSVP email notification` hatasini kontrol edin.

Uygulama parolasini sohbete veya Git'e gondermeyin. `backend/.env` dosyasi `backend/.gitignore` ile ignore edilir.

Backend container içinde veritabanına `postgres` host adıyla bağlanır. Lokal `.env` dosyasında kullanılan `localhost` bağlantısı Docker dışındaki geliştirme için kalabilir.
