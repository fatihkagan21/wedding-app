import { Prisma } from "@prisma/client";
import * as repo from "./event.repository";
import { CreateEventDto } from "./dto/create-event.dto";

export const createEvent = async (data: CreateEventDto) => {
  return repo.createEvent(data);
};

export const getEvent = async () => {
  return repo.getEvent();
};

export const getEventById = async (id: string) => {
  return repo.getEventById(id);
};

export const deleteEvent = async (id: string) => {
  return repo.deleteEvent(id);
};

