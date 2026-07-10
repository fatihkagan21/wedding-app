import { CreateRsvpDto } from "./dto/create-rsvp.dto.js";
import * as eventRepo from "../event/event.repository.js";
import * as repo from "./rsvp.repository.js";
import { AppError } from "../../shared/errors/AppError.js";

const duplicateGuestWarning = "Bu isim katılımcı listesinde zaten görünüyor. Aynı isimli farklı bir misafirseniz kaydınızı yine gönderebilirsiniz.";

const normalizeGuestName = (name: string): string => {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");
};

const getSubmittedGuestNames = (data: CreateRsvpDto): string[] => {
  const names = data.attending && data.attendees?.length
    ? data.attendees
    : [data.contactFullName];

  return names
    .map(normalizeGuestName)
    .filter(Boolean);
};

const getExistingGuestNames = (rsvp: Awaited<ReturnType<typeof repo.getRsvpByEvent>>[number]): string[] => {
  const attendeeNames = Array.isArray(rsvp.attendees)
    ? rsvp.attendees.filter((name): name is string => typeof name === "string")
    : [];

  return [rsvp.contactFullName, ...attendeeNames]
    .map(normalizeGuestName)
    .filter(Boolean);
};

const findDuplicateGuestName = async (eventId: string, names: string[]): Promise<string | undefined> => {
  const submittedNames = new Set(
    names
      .map(normalizeGuestName)
      .filter(Boolean)
  );

  if (!submittedNames.size) return undefined;

  const existingRsvps = await repo.getRsvpByEvent(eventId);
  return existingRsvps
    .flatMap(getExistingGuestNames)
    .find((name) => submittedNames.has(name));
};

export const createRsvp = async (data: CreateRsvpDto) => {
  const event = await eventRepo.getEventById(data.eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (data.attending) {
    if (!data.attendeeCount) {
      throw new AppError("Attendee count required", 400);
    }

    if (!data.attendees?.length) {
      throw new AppError("Attendees required", 400);
    }

    if (data.attendeeCount !== data.attendees.length) {
      throw new AppError(
        "Attendee count and attendees list mismatch",
        400
      );
    }
  } else if (data.attendeeCount || data.attendees?.length) {
    throw new AppError("Attendee count and attendees should be empty when not attending", 400);
  }

  const duplicateName = await findDuplicateGuestName(data.eventId, getSubmittedGuestNames(data));
  const rsvp = await repo.createRsvp(data);

  return duplicateName
    ? {
      ...rsvp,
      warning: duplicateGuestWarning,
    }
    : rsvp;
};

export const checkRsvpName = async (eventId: string, name: string) => {
  const event = await eventRepo.getEventById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const duplicateName = await findDuplicateGuestName(eventId, [name]);

  return duplicateName
    ? {
      duplicate: true,
      warning: duplicateGuestWarning,
    }
    : {
      duplicate: false,
    };
};

export const getRsvpByEvent = async (eventId: string) => {
  return repo.getRsvpByEvent(eventId);
};

export const getRsvpById = async (id: string) => {
  return repo.getRsvpById(id);
};

export const deleteRsvp = async (id: string) => {
  return repo.deleteRsvp(id);
};
