import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.event.upsert({
    where: { id: '991c4c5b-bb31-43d8-bcea-ab4bbf2c636a' },
    update: {},
    create: {
      id: '991c4c5b-bb31-43d8-bcea-ab4bbf2c636a',
      title: 'Fatih & Özge Wedding',
      brideName: 'Özge',
      groomName: 'Fatih Kağan',
      description: 'Hayatımızın en güzel gününde yanımızda olmanız bizim için büyük bir mutluluk. Sevgi, neşe ve güzel anılarla dolu bir gün geçirmek için sizleri bekliyoruz.',
      venueName: 'Yaka Davet Çiçekliköy',
      venueAddress: 'İzmir, Türkiye',
      eventDate: new Date('2026-09-05T17:00:00.000Z'),
      heroImageUrl: 'https://example.com/image.jpg',
      musicUrl: 'https://example.com/music.mp3',
      googleMapsUrl: 'https://maps.app.goo.gl/pM5ryHxAXqqqyg3j6'
    }
  });
}

main()
  .catch((error) => {
    console.error('Production seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
