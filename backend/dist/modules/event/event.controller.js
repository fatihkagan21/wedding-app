"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.getEventById = exports.getEvent = exports.createEvent = void 0;
const service = __importStar(require("./event.service"));
const create_event_schema_1 = require("./validation/create-event.schema");
const zod_1 = require("zod");
const createEvent = async (req, res) => {
    const result = create_event_schema_1.createEventSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: zod_1.z.treeifyError(result.error),
        });
    }
    try {
        const event = await service.createEvent(result.data);
        res.status(201).json(event);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create event" });
    }
};
exports.createEvent = createEvent;
const getEvent = async (req, res) => {
    try {
        const events = await service.getEvent();
        res.status(200).json(events);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch events" });
    }
};
exports.getEvent = getEvent;
const getEventById = async (req, res) => {
    const id = req.params.id;
    try {
        const event = await service.getEventById(id);
        if (event) {
            res.status(200).json(event);
        }
        else {
            res.status(404).json({ error: "Event not found" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch event" });
    }
};
exports.getEventById = getEventById;
const deleteEvent = async (req, res) => {
    const id = req.params.id;
    try {
        await service.deleteEvent(id);
        res.status(204).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete event" });
    }
};
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=event.controller.js.map