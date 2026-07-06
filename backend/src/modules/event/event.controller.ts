import * as service from "./event.service.js";
import { Request, Response } from "express";
import { createEventSchema } from "./validation/create-event.schema.js";
import { createEventCalendarICS } from "./event.calendar.js";
import { z } from "zod";

const buildPublicUrl = (req: Request): string => {
  const frontendUrl = process.env.FRONTEND_PUBLIC_URL?.replace(/\/$/, '');
  if (frontendUrl) {
    return `${frontendUrl}`;
  }

  const forwardedProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
  const protocol = forwardedProto ?? req.protocol ?? 'https';
  const host = req.get('host') ?? 'localhost:3000';
  return `${protocol}://${host}`;
};

const isMobileCalendarRequest = (req: Request): boolean => {
  if (req.get('sec-ch-ua-mobile') === '?1') return true;

  const userAgent = req.get('user-agent') ?? '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
};

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

export const getEventCalendar = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const event = await service.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const publicUrl = buildPublicUrl(req);
    const calendar = createEventCalendarICS(event, publicUrl);
    const disposition = isMobileCalendarRequest(req) ? 'inline' : 'attachment';

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `${disposition}; filename="wedding-event.ics"`);
    res.status(200).send(calendar);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate calendar file" });
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
