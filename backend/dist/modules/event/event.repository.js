"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.getEventById = exports.getEvent = exports.createEvent = void 0;
const prisma_1 = require("../prisma");
const createEvent = (data) => {
    return prisma_1.prisma.event.create({
        data: {
            coupleName: data.coupleName,
            date: data.date,
            venue: data.venue,
            address: data.address,
        },
    });
};
exports.createEvent = createEvent;
const getEvent = () => {
    return prisma_1.prisma.event.findMany();
};
exports.getEvent = getEvent;
const getEventById = (id) => {
    return prisma_1.prisma.event.findUnique({ where: { id } });
};
exports.getEventById = getEventById;
const deleteEvent = (id) => {
    return prisma_1.prisma.event.delete({ where: { id } });
};
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=event.repository.js.map