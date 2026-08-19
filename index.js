require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { connectDB } = require("./config/db");

const bookRoutes = require("./routes/bookRoutes");
const homeRoutes = require("./routes/homeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ======================================
// CORS
// ======================================

const allowedOrigins = [
    "http://localhost:5173",
    "https://dhawa-publication-client.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without origin
            // such as Postman/server-to-server
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
// ROOT
// ======================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Dhawa Publication Server Running...",
    });
});

// ======================================
// ROUTES
// ======================================

app.use("/books", bookRoutes);

app.use("/home", homeRoutes);

app.use("/categories", categoryRoutes);

app.use("/admin", adminRoutes);

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