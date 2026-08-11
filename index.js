require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { connectDB, getDB } = require("./config/db");

// ======================================
// Routes
// ======================================

const bookRoutes = require("./routes/bookRoutes");
const homeRoutes = require("./routes/homeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ======================================
// Middleware
// ======================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://dhawa-publication-client.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin
      // Example: Postman / server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked:", origin);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ======================================
// Root Route
// ======================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dhawa Publication Server Running...",
  });
});

// ======================================
// Start Database + Register Routes
// ======================================

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    console.log("✅ MongoDB Connected");

    // Get database
    const db = getDB();

    // ======================================
    // Collections
    // ======================================

    const collections = {
      usersCollection: db.collection("users"),
      booksCollection: db.collection("books"),
      categoriesCollection: db.collection("categories"),
      authorsCollection: db.collection("authors"),
      ordersCollection: db.collection("orders"),
      reviewsCollection: db.collection("reviews"),
      blogsCollection: db.collection("blogs"),
      bannersCollection: db.collection("banners"),
      couponsCollection: db.collection("coupons"),
      newslettersCollection: db.collection("newsletters"),
    };

    // ======================================
    // Routes
    // ======================================

    app.use("/books", bookRoutes);
    app.use("/home", homeRoutes);
    app.use("/categories", categoryRoutes);
    app.use("/admin", adminRoutes);

    // ======================================
    // 404 Handler
    // ======================================

    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
      });
    });

    console.log("✅ Routes registered");

    // ======================================
    // Local Development
    // ======================================

    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(
          `🚀 Server running on http://localhost:${PORT}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Server startup failed:", error);
  }
};

// Start server/database
startServer();

// ======================================
// Export Express App for Vercel
// ======================================

module.exports = app;