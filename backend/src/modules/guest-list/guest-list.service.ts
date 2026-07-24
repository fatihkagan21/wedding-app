import { AppError } from "../../shared/errors/AppError.js";
import * as eventRepo from "../event/event.repository.js";
import {
  CreateGuestListEntryDto,
  UpdateGuestListEntryDto,
} from "./dto/guest-list-entry.dto.js";
import * as repo from "./guest-list.repository.js";

const requireEvent = async (eventId: string) => {
  const event = await eventRepo.getEventById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }
};

export const getGuestListByEvent = async (eventId: string) => {
  await requireEvent(eventId);
  return repo.getGuestListByEvent(eventId);
};

export const createGuestListEntry = async (data: CreateGuestListEntryDto) => {
  await requireEvent(data.eventId);
  return repo.createGuestListEntry(data);
};

export const createGuestListEntries = async (
  entries: CreateGuestListEntryDto[]
) => {
  const eventIds = new Set(entries.map((entry) => entry.eventId));
  if (eventIds.size !== 1) {
    throw new AppError("Bulk entries must belong to the same event", 400);
  }

  await requireEvent(entries[0].eventId);
  return repo.createGuestListEntries(entries);
};

export const updateGuestListEntry = async (
  id: string,
  data: UpdateGuestListEntryDto
) => {
  const existing = await repo.getGuestListEntryById(id);
  if (!existing) {
    throw new AppError("Guest list entry not found", 404);
  }

  return repo.updateGuestListEntry(id, data);
};

export const deleteGuestListEntry = async (id: string) => {
  const existing = await repo.getGuestListEntryById(id);
  if (!existing) {
    throw new AppError("Guest list entry not found", 404);
  }

  return repo.deleteGuestListEntry(id);
};
