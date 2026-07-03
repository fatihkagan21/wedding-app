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
    update: {
      venueAddress: 'Çiçekli Mahallesi, Çamlık Caddesi No:41, 35040 Bornova/İzmir',
      googleMapsUrl: 'https://maps.app.goo.gl/9UmBhdVZrw6RhZef6',
      googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3122.466699672755!2d27.294716977168452!3d38.49994607005553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b97b00457ef023%3A0xd8f6655feeb9970f!2sYaka%20Davet!5e0!3m2!1sen!2str!4v1783061234289!5m2!1sen!2str'
    },
    create: {
      id: '991c4c5b-bb31-43d8-bcea-ab4bbf2c636a',
      title: 'Fatih & Özge Wedding',
      brideName: 'Özge',
      groomName: 'Fatih Kağan',
      description: 'Hayatımızın en güzel gününde yanımızda olmanız bizim için büyük bir mutluluk. Sevgi, neşe ve güzel anılarla dolu bir gün geçirmek için sizleri bekliyoruz.',
      venueName: 'Yaka Davet Çiçekliköy',
      venueAddress: 'Çiçekli Mahallesi, Çamlık Caddesi No:41, 35040 Bornova/İzmir',
      eventDate: new Date('2026-09-05T17:00:00.000Z'),
      heroImageUrl: 'https://example.com/image.jpg',
      musicUrl: 'https://example.com/music.mp3',
      googleMapsUrl: 'https://maps.app.goo.gl/9UmBhdVZrw6RhZef6',
      googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3122.466699672755!2d27.294716977168452!3d38.49994607005553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b97b00457ef023%3A0xd8f6655feeb9970f!2sYaka%20Davet!5e0!3m2!1sen!2str!4v1783061234289!5m2!1sen!2str'
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
