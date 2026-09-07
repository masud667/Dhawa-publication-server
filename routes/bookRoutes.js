const express = require("express");
const { ObjectId } = require("mongodb");

const { getDB } = require("../config/db");

const router = express.Router();

// =====================================================
// GET ALL BOOKS
// GET /books
// =====================================================

router.get("/", async (req, res) => {
    try {
        const db = getDB();

        const books = await db
            .collection("books")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json(books);
    } catch (error) {
        console.error("❌ Get books error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get books",
        });
    }
});


// =====================================================
// GET SINGLE BOOK
// GET /books/:id
// =====================================================

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID",
            });
        }

        const db = getDB();

        const book = await db.collection("books").findOne({
            _id: new ObjectId(id),
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        res.status(200).json(book);
    } catch (error) {
        console.error("❌ Get single book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get book",
        });
    }
});




// =====================================================
// 2. GET RELATED BOOKS
// GET /books/related?category=Novel&exclude=BOOK_ID
// IMPORTANT: MUST be placed BEFORE /:id
// =====================================================


router.get("/related", async (req, res) => {
    try {
        const { category, exclude } = req.query;

        // 1. Category validation
        if (!category || category.trim() === "" || category === "undefined") {
            return res.status(400).json({
                success: false,
                message: "A valid category query parameter is required",
            });
        }

        const db = getDB();

        // Safe Regex search for case-insensitive exact category matching
        const cleanCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const query = {
            category: { $regex: new RegExp(`^${cleanCategory}$`, "i") },
        };

        // 2. Strict ID exclusion handling
        if (exclude && exclude !== "undefined" && exclude !== "null") {
            // Regex check for exact 24-character hex string (Standard MongoDB ObjectId format)
            const is24Hex = /^[0-9a-fA-F]{24}$/.test(exclude);

            if (is24Hex) {
                // Safely exclude both ObjectId type and String type (in case schema varies)
                query._id = {
                    $nin: [new ObjectId(exclude), exclude]
                };
            } else {
                // If it's a custom string ID, exclude plain string directly
                query._id = { $ne: exclude };
            }
        }

        const books = await db
            .collection("books")
            .find(query)
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        return res.status(200).json(books);
    } catch (error) {
        console.error("❌ Related books error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get related books",
            error: error.message,
        });
    }
});





// =====================================================
// CREATE BOOK
// POST /books
// =====================================================

router.post("/", async (req, res) => {
    try {
        const db = getDB();

        const book = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db
            .collection("books")
            .insertOne(book);

        res.status(201).json({
            success: true,
            message: "Book created successfully",
            insertedId: result.insertedId,
        });
    } catch (error) {
        console.error("❌ Create book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create book",
        });
    }
});


// =====================================================
// UPDATE BOOK
// PATCH /books/:id
// =====================================================

router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID",
            });
        }

        const db = getDB();

        // Don't allow _id to be modified
        const { _id, ...updateData } = req.body;

        const result = await db.collection("books").updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        // Return updated book
        const updatedBook = await db.collection("books").findOne({
            _id: new ObjectId(id),
        });

        res.status(200).json({
            success: true,
            message: "Book updated successfully",
            book: updatedBook,
        });
    } catch (error) {
        console.error("❌ Update book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update book",
        });
    }
});


// =====================================================
// DELETE BOOK
// DELETE /books/:id
// =====================================================

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID",
            });
        }

        const db = getDB();

        const result = await db.collection("books").deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Book deleted successfully",
        });
    } catch (error) {
        console.error("❌ Delete book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete book",
        });
    }
});


module.exports = router;