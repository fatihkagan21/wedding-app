import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const createEvent = (data: Prisma.EventCreateInput) => {
    return prisma.event.create({ data });
  };
export const listEvents = () => {
    return prisma.event.findMany();
  };
export const getEventById = (id: string) => {
    return prisma.event.findUnique({ where: { id } });
  };
export const deleteEvent = (id: string) => {
    return prisma.event.delete({ where: { id } });
  };