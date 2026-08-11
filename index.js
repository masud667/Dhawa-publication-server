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

// ======================================
// PORT
// ======================================

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
    origin: allowedOrigins,
    credentials: true,
  })
);

// ======================================
// Middleware
// ======================================

app.use(express.json());
app.use(cookieParser());

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
// DATABASE
// ======================================

connectDB()
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Local only
    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(
          `🚀 Server running on http://localhost:${PORT}`
        );
      });
    }
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
  });

// ======================================
// EXPORT FOR VERCEL
// ======================================

module.exports = app;