import { z } from "zod";

export const createRsvpSchema = z.object({
  eventId: z.string(),
  contactFullName: z.string().min(2),
  attending: z.boolean(),
  attendeeCount: z.number().int().positive().optional(),
  attendees: z.array(z.string()).optional(),
  notes: z.string().optional(),
});