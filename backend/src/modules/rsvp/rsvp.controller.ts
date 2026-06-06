import * as service from "./rsvp.service";
import { Request, Response } from "express";
import { createRsvpSchema } from "./validation/rsvp.validation";
import { AppError } from "../../shared/errors/AppError";
import { z } from "zod";

export const createRsvp = async (req: Request, res: Response) => {
    const result = createRsvpSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: z.treeifyError(result.error),
      });
    }
  
    try {
        const rsvp = await service.createRsvp(result.data);
        res.status(201).json(rsvp);
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
              error: error.message,
            });
          }
      
          return res.status(500).json({
            error: "Failed to create RSVP",
          });
    }
}

export const getRsvpByEvent = async (req: Request, res: Response) => {
    const eventId = req.params.eventId as string;
    try{
        const rsvps = await service.getRsvpByEvent(eventId);
        res.status(200).json(rsvps);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch RSVPs" });
    }
}

export const getRsvpById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const rsvp = await service.getRsvpById(id);
        if (rsvp) {
            res.status(200).json(rsvp);
        } else {
            res.status(404).json({ error: "RSVP not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch RSVP" });
    }
}

export const deleteRsvp = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        await service.deleteRsvp(id);
        res.status(204).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete RSVP" });
    }
}