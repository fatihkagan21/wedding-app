"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRsvpSchema = void 0;
const zod_1 = require("zod");
exports.createRsvpSchema = zod_1.z.object({
    eventId: zod_1.z.string(),
    contactFullName: zod_1.z.string().min(2),
    attending: zod_1.z.boolean(),
    attendeeCount: zod_1.z.number().int().positive().optional(),
    attendees: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
});
//# sourceMappingURL=create-rsvp.schema.js.map