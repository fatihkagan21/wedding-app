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
exports.deleteRsvp = exports.getRsvpById = exports.getRsvpByEvent = exports.createRsvp = void 0;
const eventRepo = __importStar(require("../event/event.repository"));
const repo = __importStar(require("./rsvp.repository"));
const AppError_1 = require("../../shared/errors/AppError");
const createRsvp = async (data) => {
    const event = await eventRepo.getEventById(data.eventId);
    if (!event) {
        throw new AppError_1.AppError("Event not found", 404);
    }
    if (data.attending) {
        if (!data.attendeeCount) {
            throw new AppError_1.AppError("Attendee count required", 400);
        }
        if (!data.attendees?.length) {
            throw new AppError_1.AppError("Attendees required", 400);
        }
        if (data.attendeeCount !== data.attendees.length) {
            throw new AppError_1.AppError("Attendee count and attendees list mismatch", 400);
        }
    }
    else {
        if (data.attendeeCount || data.attendees?.length) {
            throw new AppError_1.AppError("Attendee count and attendees should be empty when not attending", 400);
        }
    }
    return repo.createRsvp(data);
};
exports.createRsvp = createRsvp;
const getRsvpByEvent = async (eventId) => {
    return repo.getRsvpByEvent(eventId);
};
exports.getRsvpByEvent = getRsvpByEvent;
const getRsvpById = async (id) => {
    return repo.getRsvpById(id);
};
exports.getRsvpById = getRsvpById;
const deleteRsvp = async (id) => {
    return repo.deleteRsvp(id);
};
exports.deleteRsvp = deleteRsvp;
//# sourceMappingURL=rsvp.service.js.map