import { Router } from "express";
import * as controller from "./rsvp.controller";

const router = Router();

router.post("/", controller.createRsvp);
router.get("/event/:eventId", controller.getRsvpByEvent);
router.get("/:id", controller.getRsvpById);
router.delete("/:id", controller.deleteRsvp);

export default router;