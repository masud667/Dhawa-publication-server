const jwt = require("jsonwebtoken");

// Verifies Bearer JWT token in headers
exports.protect = (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
        try {
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Expecting { id, email, role }
            return next();
        } catch (error) {
            return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
        }
    }

    return res.status(401).json({ success: false, message: "Not authorized, token missing" });
};

// Verifies admin role attached by protect
exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ success: false, message: "Access denied: Admin privileges required" });
};

// Validates POST request body before inserting to DB
exports.validateOrder = (req, res, next) => {
    const { email, items } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Customer email is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Order items array is required and cannot be empty" });
    }

    next();
};