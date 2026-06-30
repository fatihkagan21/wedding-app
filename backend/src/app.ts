import express from "express";
import eventRoutes from "./modules/event/event.routes";
import rsvpRoutes from "./modules/rsvp/rsvp.routes";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/events", eventRoutes);
app.use("/rsvp", rsvpRoutes);

export default app;
