"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("./event.controller");
const router = (0, express_1.Router)();
router.post("/", event_controller_1.createEvent);
router.get("/", event_controller_1.getEvent);
router.get("/:id", event_controller_1.getEventById);
router.delete("/:id", event_controller_1.deleteEvent);
exports.default = router;
//# sourceMappingURL=event.routes.js.map