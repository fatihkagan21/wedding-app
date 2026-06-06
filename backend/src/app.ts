import express from "express";
import eventRoutes from "./modules/event/event.routes";
import rsvpRoutes from "./modules/rsvp/rsvp.routes";

const app = express();

app.use(express.json());

app.use("/events", eventRoutes);
app.use("/rsvp", rsvpRoutes);

export default app;