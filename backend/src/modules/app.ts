import express from "express";
import eventRoutes from "./event/event.routes";
import rsvpRoutes from "./rsvp/rsvp.routes";

const app = express();

app.use(express.json());

app.use("/events", eventRoutes);
app.use("/rsvps", rsvpRoutes);

export default app;