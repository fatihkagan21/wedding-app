"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventSchema = void 0;
const zod_1 = require("zod");
exports.createEventSchema = zod_1.z.object({
    title: zod_1.z.string(),
    brideName: zod_1.z.string(),
    groomName: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    venueName: zod_1.z.string(),
    venueAddress: zod_1.z.string(),
    eventDate: zod_1.z.coerce.date(),
    heroImageUrl: zod_1.z.string().regex(/^https?:\/\/[^\s$.?#].[^\s]*$/).optional(),
    musicUrl: zod_1.z.string().regex(/^https?:\/\/[^\s$.?#].[^\s]*$/).optional(),
});
//# sourceMappingURL=create-event.schema.js.map