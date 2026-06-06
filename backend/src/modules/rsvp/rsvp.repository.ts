import { prisma } from "../prisma";
import { CreateRsvpDto } from "./dto/create-rsvp.dto";

export const createRsvp = (data: CreateRsvpDto) => {
    return prisma.rsvp.create({
        data: {
          eventId: data.eventId,
          name: data.name,
          phone: data.phone,
          attending: data.attending,
          guestCount: data.guestCount,
          message: data.message,
        },
    });
};

export const getRsvpByEvent = (eventId: string) => {
    return prisma.rsvp.findMany({ where: { eventId } });
};

export const getRsvpById = (id: string) => {
    return prisma.rsvp.findUnique({ where: { id } });
};

export const deleteRsvp = (id: string) => {
    return prisma.rsvp.delete({ where: { id } });
};

export const findByEventAndPhone = (eventId: string, phone: string) => {
    return prisma.rsvp.findFirst({ where: { eventId, phone } });
};