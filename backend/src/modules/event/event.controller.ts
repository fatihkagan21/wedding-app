import { Prisma } from "@prisma/client";
import * as service from "./event.service";
import { Request, Response } from "express";


export const createEvent = async (req: Request, res: Response) => {
  try {
    const event = await service.createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  }
};

export const listEvents = async (req: Request, res: Response) => {

  try {
    const events = await service.listEvents();
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
