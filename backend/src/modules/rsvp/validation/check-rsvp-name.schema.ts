import { z } from "zod";

export const checkRsvpNameSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().min(2),
});
