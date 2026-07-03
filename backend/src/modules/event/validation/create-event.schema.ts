import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string(),

  brideName: z.string(),
  groomName: z.string(),

  description: z.string().optional(),

  venueName: z.string(),
  venueAddress: z.string(),

  eventDate: z.coerce.date(),

  heroImageUrl: z.string().regex(/^https?:\/\/[^\s$.?#].[^\s]*$/).optional(),
  musicUrl: z.string().regex(/^https?:\/\/[^\s$.?#].[^\s]*$/).optional(),
  googleMapsUrl: z.string().url().optional(),
  googleMapsEmbedUrl: z.string().url().optional(),
});
