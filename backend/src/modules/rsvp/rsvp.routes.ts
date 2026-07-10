import { Router } from "express";
import * as controller from "./rsvp.controller.js";
import { requireAdmin } from "../../shared/middleware/admin-auth.middleware.js";
import { createRateLimit, getRateLimitConfig } from "../../shared/middleware/rate-limit.middleware.js";

const router = Router();
const rsvpCreateRateLimit = createRateLimit({
  ...getRateLimitConfig("RSVP_RATE_LIMIT", {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  }),
  message: "Çok fazla katılım bildirimi gönderildi. Lütfen biraz sonra tekrar deneyin.",
});

router.post("/", rsvpCreateRateLimit, controller.createRsvp);
router.get("/event/:eventId", requireAdmin, controller.getRsvpByEvent);
router.get("/:id", requireAdmin, controller.getRsvpById);
router.delete("/:id", requireAdmin, controller.deleteRsvp);

export default router;
