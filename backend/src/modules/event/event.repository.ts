import { prisma } from "../prisma";
import { CreateEventDto } from "./dto/create-event.dto";

export const createEvent = (data: CreateEventDto) => {
  return prisma.event.create({ data });

};
export const getEvent = () => {
    return prisma.event.findMany();
  };
export const getEventById = (id: string) => {
    return prisma.event.findUnique({ where: { id } });
  };
export const deleteEvent = (id: string) => {
    return prisma.event.delete({ where: { id } });
  };