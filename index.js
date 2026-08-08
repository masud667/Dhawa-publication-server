require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { connectDB, getDB } = require("./config/db");

// Routes

const bookRoutes = require("./routes/bookRoutes");
const homeRoutes = require("./routes/homeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");


const app = express();

const PORT = process.env.PORT || 5000;

// ======================================
// Middleware
// ======================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ======================================
// Root Route
// ======================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dhawa Publication Server Running...",
  });
});

// ======================================
// Start Server
// ======================================

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

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



    // ======================================
    // 404 Handler
    // ======================================

    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
      });
    });

    // ======================================
    // Start Express
    // ======================================

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

