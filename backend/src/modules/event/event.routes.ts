import { Router } from "express";
import {
  createEvent,
  getEvent,
  getEventById,
  getEventCalendar,
  deleteEvent,
} from "./event.controller.js";
import { requireAdmin } from "../../shared/middleware/admin-auth.middleware.js";

const router = Router();

router.post("/", requireAdmin, createEvent);
router.get("/", getEvent);
router.get("/:id/calendar.ics", getEventCalendar);
router.get("/:id", getEventById);
router.delete("/:id", requireAdmin, deleteEvent);

export default router;
