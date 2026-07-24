import { prisma } from "../prisma.js";
import {
  CreateGuestListEntryDto,
  UpdateGuestListEntryDto,
} from "./dto/guest-list-entry.dto.js";

export const getGuestListByEvent = (eventId: string) => {
  return prisma.guestListEntry.findMany({
    where: { eventId },
    orderBy: [{ createdAt: "asc" }, { displayName: "asc" }],
  });
};

export const getGuestListEntryById = (id: string) => {
  return prisma.guestListEntry.findUnique({ where: { id } });
};

export const createGuestListEntry = (data: CreateGuestListEntryDto) => {
  return prisma.guestListEntry.create({ data });
};

export const createGuestListEntries = (entries: CreateGuestListEntryDto[]) => {
  return prisma.$transaction(
    entries.map((data) => prisma.guestListEntry.create({ data }))
  );
};

export const updateGuestListEntry = (
  id: string,
  data: UpdateGuestListEntryDto
) => {
  return prisma.guestListEntry.update({ where: { id }, data });
};

export const deleteGuestListEntry = (id: string) => {
  return prisma.guestListEntry.delete({ where: { id } });
};
