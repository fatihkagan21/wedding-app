import { CreateRsvpDto } from "./dto/create-rsvp.dto";
import * as eventRepo from "../event/event.repository";
import * as repo from "./rsvp.repository";
import { AppError } from "../../shared/errors/AppError";


export const createRsvp = async (data: CreateRsvpDto) => {
    const event  = await eventRepo.getEventById(data.eventId);    
    if (!event) {
        throw new AppError("Event not found", 404);
    }

    const existing = await repo.findByEventAndPhone(data.eventId, data.phone);

    if (existing) {
        throw new AppError("Already RSVP'd", 409);
    }

    return repo.createRsvp(data);
}

export const getRsvpByEvent = async (eventId: string) => { 
    return repo.getRsvpByEvent(eventId);
}

export const getRsvpById = async (id: string) => {
    return repo.getRsvpById(id);
}

export const deleteRsvp = async (id: string) => {   
    return repo.deleteRsvp(id);
}