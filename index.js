require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
} = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// ==================================================
// Middlewares
// ==================================================

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, browser requests, and allowed client URLs
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ==================================================
// MongoDB Connection
// ==================================================

const uri = `mongodb+srv://${encodeURIComponent(
  process.env.DB_USER
)}:${encodeURIComponent(
  process.env.DB_PASS
)}@cluster0.cdz9cop.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ==================================================
// Database
// IMPORTANT:
// Atlas database names are case-sensitive.
// Use exactly the database name shown in MongoDB Atlas.
// ==================================================

const database = client.db("dhawaPublication");

const usersCollection = database.collection("users");
const booksCollection = database.collection("books");
const categoriesCollection = database.collection("categories");
const authorsCollection = database.collection("authors");
const ordersCollection = database.collection("orders");
const reviewsCollection = database.collection("reviews");
const blogsCollection = database.collection("blogs");
const bannersCollection = database.collection("banners");
const couponsCollection = database.collection("coupons");
const newslettersCollection = database.collection("newsletters");

// ==================================================
// Helper Functions
// ==================================================

const getPublishedBooks = async (query = {}, limit = 10) => {
  return booksCollection
    .find({
      ...query,
      status: "published",
    })
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .limit(limit)
    .toArray();
};

// ==================================================
// Default Route
// ==================================================

app.get("/", (req, res) => {
  res.send("Dhawa Publication Server Running...");
});

// ==================================================
// GET all books
// ==================================================
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
// ==================================================
// Health Check
// ==================================================

app.get("/health", async (req, res) => {
  try {
    await client.db("admin").command({ ping: 1 });

    res.status(200).json({
      success: true,
      message: "Server and MongoDB are working",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "MongoDB connection failed",
      error: error.message,
    });
  }
});

// ==================================================
// Home APIs
// ==================================================

// ---------------------------
// Banner
// GET: /banner
// ---------------------------

app.get("/banner", async (req, res) => {
  try {
    const banners = await bannersCollection
      .find({
        status: "active",
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.status(200).json(banners);
  } catch (error) {
    console.error("Banner API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get banners",
      error: error.message,
    });
  }
});

// ---------------------------
// Recent Books
// GET: /recent-books
// ---------------------------

app.get("/recent-books", async (req, res) => {
  try {
    const books = await booksCollection
      .find({
        status: "published",
      })
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .limit(10)
      .toArray();

    res.status(200).json(books);
  } catch (error) {
    console.error("Recent books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get recent books",
      error: error.message,
    });
  }
});

// ---------------------------
// Featured Books
// GET: /featured-books
// ---------------------------

app.get("/featured-books", async (req, res) => {
  try {
    const books = await getPublishedBooks(
      {
        featured: true,
      },
      10
    );

    res.status(200).json(books);
  } catch (error) {
    console.error("Featured books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get featured books",
      error: error.message,
    });
  }
});

// ---------------------------
// Best Seller
// GET: /best-seller
// ---------------------------

app.get("/best-seller", async (req, res) => {
  try {
    const books = await getPublishedBooks(
      {
        bestSeller: true,
      },
      10
    );

    res.status(200).json(books);
  } catch (error) {
    console.error("Best seller error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get best seller books",
      error: error.message,
    });
  }
});

// ==================================================
// Home Book Sections
// ==================================================

// ---------------------------
// পাঠকপ্রিয় বই
// GET: /books/popular
// ---------------------------

app.get("/books/popular", async (req, res) => {
  try {
    const books = await booksCollection
      .find({
        status: "published",
        $or: [
          {
            section: "পাঠকপ্রিয় বই",
          },
          {
            popular: true,
          },
        ],
      })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .toArray();

    res.status(200).json(books);
  } catch (error) {
    console.error("Popular books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get popular books",
      error: error.message,
    });
  }
});

// ---------------------------
// মুসলিম জীবন রচিত
// GET: /books/muslim-life
// ---------------------------

app.get("/books/muslim-life", async (req, res) => {
  try {
    const books = await getPublishedBooks(
      {
        section: "মুসলিম জীবন রচিত",
      },
      10
    );

    res.status(200).json(books);
  } catch (error) {
    console.error("Muslim life books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get Muslim life books",
      error: error.message,
    });
  }
});

// ---------------------------
// নারীদের নির্বাচিত বই
// GET: /books/women
// ---------------------------

app.get("/books/women", async (req, res) => {
  try {
    const books = await getPublishedBooks(
      {
        section: "নারীদের নির্বাচিত বই",
      },
      10
    );

    res.status(200).json(books);
  } catch (error) {
    console.error("Women books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get women books",
      error: error.message,
    });
  }
});

// ---------------------------
// আমল ও আত্মশুদ্ধির বই
// GET: /books/self-purification
// ---------------------------

app.get("/books/self-purification", async (req, res) => {
  try {
    const books = await getPublishedBooks(
      {
        section: "আমল ও আত্মশুদ্ধির বই",
      },
      10
    );

    res.status(200).json(books);
  } catch (error) {
    console.error("Self-purification books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get self-purification books",
      error: error.message,
    });
  }
});

// ---------------------------
// তালীমের বই
// GET: /books/talim
// ---------------------------

app.get("/books/talim", async (req, res) => {
  try {
    const books = await getPublishedBooks(
      {
        section: "তালীমের বই",
      },
      10
    );

    res.status(200).json(books);
  } catch (error) {
    console.error("Talim books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get Talim books",
      error: error.message,
    });
  }
});

// ---------------------------
// ছোটদের প্রিয় বই
// GET: /books/children
// ---------------------------

app.get("/books/children", async (req, res) => {
  try {
    const books = await getPublishedBooks(
      {
        section: "ছোটদের প্রিয় বই",
      },
      10
    );

    res.status(200).json(books);
  } catch (error) {
    console.error("Children books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get children books",
      error: error.message,
    });
  }
});

// ==================================================
// Books APIs
// ==================================================

// ---------------------------
// Get all books
// GET: /books
// ---------------------------

app.get("/books", async (req, res) => {
  try {
    const books = await booksCollection
      .find({
        status: "published",
      })
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .toArray();

    res.status(200).json(books);
  } catch (error) {
    console.error("Books API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get books",
      error: error.message,
    });
  }
});

// ---------------------------
// Related books
// IMPORTANT:
// This route must be before /books/:id
//
// GET:
// /books/related?category=ইসলামিক&exclude=BOOK_ID
// ---------------------------

app.get("/books/related", async (req, res) => {
  try {
    const {
      category,
      exclude,
    } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const query = {
      category,
      status: "published",
    };

    // Support ObjectId and string IDs
    if (exclude) {
      if (ObjectId.isValid(exclude)) {
        query._id = {
          $ne: new ObjectId(exclude),
        };
      } else {
        query._id = {
          $ne: exclude,
        };
      }
    }

    const relatedBooks = await booksCollection
      .find(query)
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .toArray();

    res.status(200).json(relatedBooks);
  } catch (error) {
    console.error("Related books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get related books",
      error: error.message,
    });
  }
});

// ---------------------------
// Get single book
// GET: /books/:id
//
// Supports:
// MongoDB ObjectId
// or manually added string _id
// ---------------------------

app.get("/books/:id", async (req, res) => {
  try {
    const {
      id,
    } = req.params;

    let book = null;

    // First try MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      book = await booksCollection.findOne({
        _id: new ObjectId(id),
      });
    }

    // If not found, try string ID
    if (!book) {
      book = await booksCollection.findOne({
        _id: id,
      });
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Book details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get book details",
      error: error.message,
    });
  }
});

// ---------------------------
// Add a book
// POST: /books
// ---------------------------

app.post("/books", async (req, res) => {
  try {
    const book = req.body;

    if (
      !book.title ||
      !book.author ||
      !book.price
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, author and price are required",
      });
    }

    const newBook = {
      ...book,
      price: Number(book.price),
      discountPrice: book.discountPrice
        ? Number(book.discountPrice)
        : null,
      stock: book.stock
        ? Number(book.stock)
        : 0,
      status:
        book.status || "published",
      createdAt:
        book.createdAt
          ? new Date(book.createdAt)
          : new Date(),
    };

    const result =
      await booksCollection.insertOne(
        newBook
      );

    res.status(201).json({
      success: true,
      message:
        "Book added successfully",
      insertedId:
        result.insertedId,
    });
  } catch (error) {
    console.error(
      "Add book error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add book",
      error:
        error.message,
    });
  }
});

// ---------------------------
// Update a book
// PATCH: /books/:id
// ---------------------------

app.patch("/books/:id", async (req, res) => {
  try {
    const {
      id,
    } = req.params;

    const updateData =
      req.body;

    let filter;

    if (
      ObjectId.isValid(id)
    ) {
      filter = {
        _id: new ObjectId(id),
      };
    } else {
      filter = {
        _id: id,
      };
    }

    const result =
      await booksCollection.updateOne(
        filter,
        {
          $set: {
            ...updateData,
            updatedAt:
              new Date(),
          },
        }
      );

    if (
      result.matchedCount === 0
    ) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Book not found",
        });
    }

    res.status(200).json({
      success: true,
      message:
        "Book updated successfully",
      result,
    });
  } catch (error) {
    console.error(
      "Update book error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update book",
      error:
        error.message,
    });
  }
});

// ---------------------------
// Delete a book
// DELETE: /books/:id
// ---------------------------

app.delete(
  "/books/:id",
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      let filter;

      if (
        ObjectId.isValid(id)
      ) {
        filter = {
          _id:
            new ObjectId(
              id
            ),
        };
      } else {
        filter = {
          _id: id,
        };
      }

      const result =
        await booksCollection.deleteOne(
          filter
        );

      if (
        result.deletedCount ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book not found",
          });
      }

      res
        .status(200)
        .json({
          success: true,
          message:
            "Book deleted successfully",
        });
    } catch (error) {
      console.error(
        "Delete book error:",
        error
      );

      res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to delete book",
          error:
            error.message,
        });
    }
  }
);

// ==================================================
// Categories
// ==================================================
app.get("/categories", async (req, res) => {
  try {
    const books = await booksCollection.find({}).toArray();
    const categoryMap = new Map();
    books.forEach(book => {
      const cat = book.category || 'অন্যান্য';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    const categories = Array.from(categoryMap, ([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count
    }));
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get categories",
      error: error.message
    });
  }
});
// app.get("/categories", async (req, res) => {
//   try {
//     const categories =
//       await categoriesCollection
//         .find({})
//         .toArray();

//     res.status(200).json(
//       categories
//     );
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message:
//         "Failed to get categories",
//       error:
//         error.message,
//     });
//   }
// });

app.post(
  "/categories",
  async (req, res) => {
    try {
      const result =
        await categoriesCollection.insertOne(
          {
            ...req.body,
            createdAt:
              new Date(),
          }
        );

      res
        .status(201)
        .json({
          success: true,
          result,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to add category",
          error:
            error.message,
        });
    }
  }
);

// ==================================================
// Authors
// ==================================================

app.get("/authors", async (req, res) => {
  try {
    const authors =
      await authorsCollection
        .find({})
        .toArray();

    res.status(200).json(
      authors
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to get authors",
      error:
        error.message,
    });
  }
});

// ==================================================
// Reviews
// ==================================================

app.get("/reviews", async (req, res) => {
  try {
    const reviews =
      await reviewsCollection
        .find({})
        .sort({
          createdAt: -1,
        })
        .toArray();

    res.status(200).json(
      reviews
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to get reviews",
      error:
        error.message,
    });
  }
});

app.post(
  "/reviews",
  async (req, res) => {
    try {
      const result =
        await reviewsCollection.insertOne(
          {
            ...req.body,
            createdAt:
              new Date(),
          }
        );

      res
        .status(201)
        .json({
          success: true,
          result,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to add review",
          error:
            error.message,
        });
    }
  }
);

// ==================================================
// Users
// ==================================================

app.get("/users", async (req, res) => {
  try {
    const users =
      await usersCollection
        .find({})
        .toArray();

    res.status(200).json(
      users
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to get users",
      error:
        error.message,
    });
  }
});

// ==================================================
// Orders
// ==================================================

app.get("/orders", async (req, res) => {
  try {
    const orders =
      await ordersCollection
        .find({})
        .sort({
          createdAt: -1,
        })
        .toArray();

    res.status(200).json(
      orders
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to get orders",
      error:
        error.message,
    });
  }
});

app.post(
  "/orders",
  async (req, res) => {
    try {
      const result =
        await ordersCollection.insertOne(
          {
            ...req.body,
            createdAt:
              new Date(),
            status:
              "pending",
          }
        );

      res
        .status(201)
        .json({
          success: true,
          result,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to create order",
          error:
            error.message,
        });
    }
  }
);

// ==================================================
// Blogs
// ==================================================

app.get("/blogs", async (req, res) => {
  try {
    const blogs =
      await blogsCollection
        .find({})
        .sort({
          createdAt: -1,
        })
        .toArray();

    res.status(200).json(
      blogs
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to get blogs",
      error:
        error.message,
    });
  }
});

// ==================================================
// Newsletter
// ==================================================

app.post(
  "/newsletter",
  async (req, res) => {
    try {
      const {
        email,
      } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email is required",
          });
      }

      const exists =
        await newslettersCollection.findOne(
          {
            email,
          }
        );

      if (exists) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Email already subscribed",
          });
      }

      const result =
        await newslettersCollection.insertOne(
          {
            email,
            createdAt:
              new Date(),
          }
        );

      res
        .status(201)
        .json({
          success: true,
          message:
            "Subscribed successfully",
          result,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message:
            "Newsletter subscription failed",
          error:
            error.message,
        });
    }
  }
);

// ==================================================
// MongoDB Start
// ==================================================

async function startServer() {
  try {
    await client.connect();

    await client
      .db("admin")
      .command({
        ping: 1,
      });

    console.log(
      "✅ MongoDB Connected"
    );

    app.listen(
      port,
      () => {
        console.log(
          `🚀 Server running on port ${port}`
        );
      }
    );
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error
    );

    process.exit(1);
  }
}

startServer();