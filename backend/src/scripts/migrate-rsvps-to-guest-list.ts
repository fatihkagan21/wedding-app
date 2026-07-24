import "dotenv/config";
import { mapRsvpToGuestListEntry } from "./rsvp-guest-list-mapping.js";

interface MigrationOptions {
  dryRun: boolean;
  eventId?: string;
}

const printUsage = () => {
  console.log(`
RSVP kayıtlarını davetli planına aktarır.

Kullanım:
  npm run migrate:rsvps-to-guest-list -- [--dry-run] [--event-id=<uuid>]

Seçenekler:
  --dry-run          Veritabanını değiştirmeden aktarım sayısını gösterir.
  --event-id=<uuid>  Yalnızca belirtilen etkinliğin RSVP kayıtlarını aktarır.
  --help             Bu açıklamayı gösterir.
`);
};

const parseOptions = (args: string[]): MigrationOptions => {
  if (args.includes("--help")) {
    printUsage();
    process.exit(0);
  }

  const eventArgument = args.find((argument) => argument.startsWith("--event-id="));
  const eventId = eventArgument?.slice("--event-id=".length).trim();

  if (eventArgument && !eventId) {
    throw new Error("--event-id değeri boş olamaz");
  }

  return {
    dryRun: args.includes("--dry-run"),
    eventId,
  };
};

const main = async () => {
  const options = parseOptions(process.argv.slice(2));
  const { prisma } = await import("../modules/prisma.js");

  try {
    if (options.eventId) {
      const event = await prisma.event.findUnique({
        where: { id: options.eventId },
        select: { id: true, title: true },
      });

      if (!event) {
        throw new Error(`Etkinlik bulunamadı: ${options.eventId}`);
      }

      console.log(`Etkinlik: ${event.title} (${event.id})`);
    }

    const rsvps = await prisma.rsvp.findMany({
      where: options.eventId ? { eventId: options.eventId } : undefined,
      orderBy: { createdAt: "asc" },
    });

    if (!rsvps.length) {
      console.log("Aktarılacak RSVP kaydı bulunamadı.");
      return;
    }

    const rsvpIds = rsvps.map((rsvp) => rsvp.id);
    const alreadyMigrated = await prisma.guestListEntry.count({
      where: { rsvpId: { in: rsvpIds } },
    });
    const pendingCount = rsvps.length - alreadyMigrated;

    console.log(`Toplam RSVP: ${rsvps.length}`);
    console.log(`Daha önce aktarılmış: ${alreadyMigrated}`);
    console.log(`Aktarılmayı bekleyen: ${pendingCount}`);

    if (options.dryRun) {
      console.log("Dry-run tamamlandı; veritabanında değişiklik yapılmadı.");
      return;
    }

    if (!pendingCount) {
      console.log("Tüm RSVP kayıtları daha önce aktarılmış.");
      return;
    }

    const result = await prisma.guestListEntry.createMany({
      data: rsvps.map(mapRsvpToGuestListEntry),
      skipDuplicates: true,
    });

    console.log(`Yeni oluşturulan davetli kaydı: ${result.count}`);
    console.log(`Atlanan mevcut kayıt: ${rsvps.length - result.count}`);
  } finally {
    await prisma.$disconnect();
  }
};

main()
  .catch((error) => {
    console.error("RSVP aktarımı başarısız:", error);
    process.exitCode = 1;
  });
