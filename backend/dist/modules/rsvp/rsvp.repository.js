"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByEventAndPhone = exports.deleteRsvp = exports.getRsvpById = exports.getRsvpByEvent = exports.createRsvp = void 0;
const prisma_1 = require("../prisma");
const createRsvp = (data) => {
    return prisma_1.prisma.rsvp.create({
        data: {
            eventId: data.eventId,
            name: data.name,
            phone: data.phone,
            attending: data.attending,
            guestCount: data.guestCount,
            message: data.message,
        },
    });
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
const findByEventAndPhone = (eventId, phone) => {
    return prisma_1.prisma.rsvp.findFirst({ where: { eventId, phone } });
};
exports.findByEventAndPhone = findByEventAndPhone;
//# sourceMappingURL=rsvp.repository.js.map