require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// ===========================
// Middlewares
// ===========================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // Production URL here
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ===========================
// MongoDB Connection
// ===========================


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cdz9cop.mongodb.net/?appName=Cluster0`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    // ===========================
    // Collections
    // ===========================

    const usersCollection = client.db("dhawaPublication").collection("users");

    const booksCollection = client.db("dhawaPublication").collection("books");

    const categoriesCollection = client
      .db("dhawaPublication")
      .collection("categories");

    const authorsCollection = client
      .db("dhawaPublication")
      .collection("authors");

    const ordersCollection = client
      .db("dhawaPublication")
      .collection("orders");

    const reviewsCollection = client
      .db("dhawaPublication")
      .collection("reviews");

    const blogsCollection = client
      .db("dhawaPublication")
      .collection("blogs");

    const bannersCollection = client
      .db("dhawaPublication")
      .collection("banners");

    const couponsCollection = client
      .db("dhawaPublication")
      .collection("coupons");

    const newslettersCollection = client
      .db("dhawaPublication")
      .collection("newsletters");

    // ===========================
    // Home Routes
    // ===========================

    app.get("/banner", async (req, res) => {});


   // Get recent books
   app.get('/recent-books', async (req, res) => {
  try {
    const recentBooks = await booksCollection
      .find({
        recent: true,
        status: 'published',
      })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .toArray();

    res.status(200).json(recentBooks);
  } catch (error) {
    console.error('Recent books error:', error);

    res.status(500).json({
      message: 'Failed to get recent books',
    });
  }
});
    app.get("/featured-books", async (req, res) => {});

    app.get("/best-seller", async (req, res) => {});

    app.get("/categories", async (req, res) => {});

    // ===========================
    // Books
    // ===========================

 // Get all books
    app.get("/books", async (req, res) => {
      try {
        const books = await booksCollection
          .find({})
          .toArray();

        res.status(200).json(books);
      } catch (error) {
        console.error("❌ Books API error:", error);

        res.status(500).json({
          success: false,
          message: "Failed to get books",
          error: error.message,
        });
      }
    });


    app.get("/books/:id", async (req, res) => {});

    app.post("/books", async (req, res) => {});

    app.patch("/books/:id", async (req, res) => {});

    app.delete("/books/:id", async (req, res) => {});

    // ===========================
    // Categories
    // ===========================

    app.get("/categories", async (req, res) => {});

    app.post("/categories", async (req, res) => {});

    // ===========================
    // Authors
    // ===========================

    app.get("/authors", async (req, res) => {});

    // ===========================
    // Reviews
    // ===========================

    app.get("/reviews", async (req, res) => {});

    app.post("/reviews", async (req, res) => {});

    // ===========================
    // Cart
    // ===========================

    app.get("/cart", async (req, res) => {});

    app.post("/cart", async (req, res) => {});

    app.delete("/cart/:id", async (req, res) => {});

    // ===========================
    // Orders
    // ===========================

    app.get("/orders", async (req, res) => {});

    app.post("/orders", async (req, res) => {});

    app.patch("/orders/:id", async (req, res) => {});

    // ===========================
    // Users
    // ===========================

    app.get("/users", async (req, res) => {});

    app.post("/users", async (req, res) => {});

    app.patch("/users/:id", async (req, res) => {});

    // ===========================
    // Blogs
    // ===========================

    app.get("/blogs", async (req, res) => {});

    app.get("/blogs/:id", async (req, res) => {});

    // ===========================
    // Newsletter
    // ===========================

    app.post("/newsletter", async (req, res) => {});

    // ===========================
    // Coupon
    // ===========================

    app.post("/coupon/apply", async (req, res) => {});

    // ===========================
    // Ping Database
    // ===========================

    await client.db("admin").command({ ping: 1 });

    console.log("✅ MongoDB Connected");
  } finally {
    // Keep connection alive
  }
}

run().catch(console.dir);

// ===========================
// Default Routes
// ===========================

app.get("/", (req, res) => {
  res.send("Dhawa Publication Server Running...");
});

// ===========================
// Server
// ===========================

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});