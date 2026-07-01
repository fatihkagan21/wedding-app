import { prisma } from "../prisma.js";
import { CreateRsvpDto } from "./dto/create-rsvp.dto.js";

export const createRsvp = (data: CreateRsvpDto) => {
    return prisma.rsvp.create({ data });
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
