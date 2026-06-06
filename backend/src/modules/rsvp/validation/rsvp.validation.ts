import { z } from "zod";

export const createRsvpSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(2),
  phone: z.string().min(10),
  attending: z.boolean(),
  guestCount: z.number().optional(),
  message: z.string().optional(),
});