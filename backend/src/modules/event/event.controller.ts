import { Prisma } from "@prisma/client";
import * as service from "./event.service";
import { Request, Response } from "express";
import { createEventSchema } from "./validation/event.validation";
import { z } from "zod";


export const createEvent = async (req: Request, res: Response) => {
    const result = createEventSchema.safeParse(req.body);
    
    if (!result.success) {
        return res.status(400).json({
          error: z.treeifyError(result.error),
        });
      }
    try {
        const event = await service.createEvent(result.data);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: "Failed to create event" });
    }
};

export const getEvent = async (req: Request, res: Response) => {

  try {
    const events = await service.getEvent();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const event = await service.getEventById(id);
        if (event) {
        res.status(200).json(event);
        } else {
        res.status(404).json({ error: "Event not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch event" });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        await service.deleteEvent(id);
        res.status(204).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete event" });
    }
};
