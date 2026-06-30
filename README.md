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

Backend container içinde veritabanına `postgres` host adıyla bağlanır. Lokal `.env` dosyasında kullanılan `localhost` bağlantısı Docker dışındaki geliştirme için kalabilir.
