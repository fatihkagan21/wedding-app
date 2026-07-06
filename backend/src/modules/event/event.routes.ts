import { Router } from "express";
import {
  createEvent,
  getEvent,
  getEventById,
  getEventCalendar,
  deleteEvent,
} from "./event.controller.js";

const router = Router();

router.post("/", createEvent);
router.get("/", getEvent);
router.get("/:id/calendar.ics", getEventCalendar);
router.get("/:id", getEventById);
router.delete("/:id", deleteEvent);

export default router;
