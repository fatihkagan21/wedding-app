"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const crypto_1 = require("crypto");
const requireAdmin = (req, res, next) => {
    const configuredKey = process.env.ADMIN_API_KEY;
    const suppliedKey = req.header("x-admin-key");
    if (!configuredKey) {
        return res.status(503).json({ error: "Admin access is not configured" });
    }
    if (!suppliedKey) {
        return res.status(401).json({ error: "Admin key is required" });
    }
    const expected = Buffer.from(configuredKey);
    const actual = Buffer.from(suppliedKey);
    const isValid = expected.length === actual.length && (0, crypto_1.timingSafeEqual)(expected, actual);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid admin key" });
    }
    return next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=admin-auth.middleware.js.map