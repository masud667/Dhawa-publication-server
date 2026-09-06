require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken"); // 1. Added jsonwebtoken

const { connectDB } = require("./config/db");

const bookRoutes = require("./routes/bookRoutes");
const homeRoutes = require("./routes/homeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ======================================
// CORS
// ======================================

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://dhawa-publication-client.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without origin (Postman, server-to-server)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },
        credentials: true,
    })
);

// ======================================
// MIDDLEWARE
// ======================================

app.use(express.json());
app.use(cookieParser());

// ======================================
// DATABASE MIDDLEWARE
// ======================================

// VERY IMPORTANT FOR VERCEL
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("❌ Database middleware error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
        });
    }
});

// ======================================
// JWT VERIFICATION MIDDLEWARE
// ======================================

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Unauthorized access: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Forbidden access: Invalid or expired token" });
        }
        req.decoded = decoded;
        next();
    });
};

// ======================================
// ROOT
// ======================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Dhawa Publication Server Running...",
    });
});

// ======================================
// JWT AUTHENTICATION ENDPOINT
// ======================================

app.post("/jwt", async (req, res) => {
    try {
        const user = req.body; // Expecting { email: "user@example.com" }

        if (!user?.email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Generate token valid for 7 days using environment secret
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || "dhawa_publication_secret_key", {
            expiresIn: "7d",
        });

        res.status(200).json({
            success: true,
            token,
        });
    } catch (error) {
        console.error("❌ JWT Generation Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to issue JWT token",
            error: error.message,
        });
    }
});

// ======================================
// ROUTES
// ======================================

app.use("/books", bookRoutes);

app.use("/home", homeRoutes);

app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);
// Protected Admin Routes (Pass verifyJWT middleware or include in adminRoutes)
app.use("/admin", verifyJWT, adminRoutes);

// ======================================
// 404
// ======================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ======================================
// LOCAL SERVER
// ======================================

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(
            `🚀 Server running on Dhawa Publication`
        );
    });
}

// ======================================
// VERCEL
// ======================================

module.exports = app;