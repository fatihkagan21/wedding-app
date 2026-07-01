import { Router } from "express";
import * as controller from "./rsvp.controller.js";
import { requireAdmin } from "../../shared/middleware/admin-auth.middleware.js";

const router = Router();

router.post("/", controller.createRsvp);
router.get("/event/:eventId", requireAdmin, controller.getRsvpByEvent);
router.get("/:id", requireAdmin, controller.getRsvpById);
router.delete("/:id", requireAdmin, controller.deleteRsvp);

export default router;
