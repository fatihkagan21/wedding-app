import { Router } from "express";
import {
  createEvent,
  listEvents,
  getEventById,
  deleteEvent,
} from "./event.controller";

const router = Router();

router.post("/", createEvent);
router.get("/", listEvents);
router.get("/:id", getEventById);
router.delete("/:id", deleteEvent);

export default router;