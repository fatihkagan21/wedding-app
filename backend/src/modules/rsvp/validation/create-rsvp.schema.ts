import { z } from "zod";

export const createRsvpSchema = z.object({
  eventId: z.string(),
  contactFullName: z.string().min(2),
  attending: z.boolean(),
  attendeeCount: z.number().int().min(0).max(5).optional(),
  attendees: z.array(z.string()).max(5).optional(),
  notes: z.string().optional(),
});
