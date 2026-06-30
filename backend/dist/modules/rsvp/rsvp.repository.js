"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRsvp = exports.getRsvpById = exports.getRsvpByEvent = exports.createRsvp = void 0;
const prisma_1 = require("../prisma");
const createRsvp = (data) => {
    return prisma_1.prisma.rsvp.create({ data });
};
exports.createRsvp = createRsvp;
const getRsvpByEvent = (eventId) => {
    return prisma_1.prisma.rsvp.findMany({ where: { eventId } });
};
exports.getRsvpByEvent = getRsvpByEvent;
const getRsvpById = (id) => {
    return prisma_1.prisma.rsvp.findUnique({ where: { id } });
};
exports.getRsvpById = getRsvpById;
const deleteRsvp = (id) => {
    return prisma_1.prisma.rsvp.delete({ where: { id } });
};
exports.deleteRsvp = deleteRsvp;
//# sourceMappingURL=rsvp.repository.js.map