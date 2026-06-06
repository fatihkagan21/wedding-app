"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRsvpSchema = void 0;
const zod_1 = require("zod");
exports.createRsvpSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(10),
    attending: zod_1.z.boolean(),
    guestCount: zod_1.z.number().optional(),
    message: zod_1.z.string().optional(),
});
//# sourceMappingURL=rsvp.validation.js.map