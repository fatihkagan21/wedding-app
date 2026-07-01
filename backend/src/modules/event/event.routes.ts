import { Router } from "express";
import {
  createEvent,
  getEvent,
  getEventById,
  deleteEvent,
} from "./event.controller.js";

const router = Router();

router.post("/", createEvent);
router.get("/", getEvent);
router.get("/:id", getEventById);
router.delete("/:id", deleteEvent);

export default router;
