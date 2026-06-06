"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventSchema = void 0;
const zod_1 = require("zod");
exports.createEventSchema = zod_1.z.object({
    coupleName: zod_1.z.string().min(2, "Couple name required"),
    date: zod_1.z.coerce.date(),
    venue: zod_1.z.string().min(2),
    address: zod_1.z.string().min(2),
});
//# sourceMappingURL=event.validation.js.map