/*
  Warnings:

  - You are about to drop the column `address` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `coupleName` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `guestCount` on the `Rsvp` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Rsvp` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Rsvp` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Rsvp` table. All the data in the column will be lost.
  - Added the required column `brideName` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groomName` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `venueAddress` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `venueName` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactFullName` to the `Rsvp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "address",
DROP COLUMN "coupleName",
DROP COLUMN "date",
DROP COLUMN "venue",
ADD COLUMN     "brideName" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "groomName" TEXT NOT NULL,
ADD COLUMN     "heroImageUrl" TEXT,
ADD COLUMN     "musicUrl" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "venueAddress" TEXT NOT NULL,
ADD COLUMN     "venueName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Rsvp" DROP COLUMN "guestCount",
DROP COLUMN "message",
DROP COLUMN "name",
DROP COLUMN "phone",
ADD COLUMN     "attendeeCount" INTEGER,
ADD COLUMN     "attendees" JSONB,
ADD COLUMN     "contactFullName" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT;
