import { CreateRsvpDto } from "./dto/create-rsvp.dto";
import * as eventRepo from "../event/event.repository";
import * as repo from "./rsvp.repository";
import { AppError } from "../../shared/errors/AppError";


export const createRsvp = async (data: CreateRsvpDto) => {
    const event  = await eventRepo.getEventById(data.eventId);    
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
    }else {
      if(data.attendeeCount || data.attendees?.length) {
        throw new AppError("Attendee count and attendees should be empty when not attending", 400);
      }
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