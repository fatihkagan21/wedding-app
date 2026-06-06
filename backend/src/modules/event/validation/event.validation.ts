import { z } from "zod";

export const createEventSchema = z.object({
  coupleName: z.string().min(2, "Couple name required"),
  date: z.coerce.date(),
  venue: z.string().min(2),
  address: z.string().min(2),
});