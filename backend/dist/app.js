"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const event_routes_1 = __importDefault(require("./modules/event/event.routes"));
const rsvp_routes_1 = __importDefault(require("./modules/rsvp/rsvp.routes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
app.use("/events", event_routes_1.default);
app.use("/rsvp", rsvp_routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map