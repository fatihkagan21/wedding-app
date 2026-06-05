import { Prisma } from "@prisma/client";
import * as repo from "./event.repository";

export const createEvent = async (data: Prisma.EventCreateInput) => {
  return repo.createEvent(data);
};

export const listEvents = async () => {
  return repo.listEvents();
};

export const getEventById = async (id: string) => {
  return repo.getEventById(id);
};

export const deleteEvent = async (id: string) => {
  return repo.deleteEvent(id);
};

