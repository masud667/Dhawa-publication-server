const express = require("express");
const { ObjectId } = require("mongodb");

const { getDB } = require("../config/db");

const router = express.Router();

// =====================================
// GET ALL BOOKS
// GET /books
// =====================================

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
        console.error("Get books error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get books",
        });
    }
});

// =====================================
// GET SINGLE BOOK
// GET /books/:id
// =====================================

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

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
        console.error("Get book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get book",
        });
    }
});

// =====================================
// CREATE BOOK
// POST /books
// =====================================

router.post("/", async (req, res) => {
    try {
        const db = getDB();

        const book = {
            ...req.body,
            createdAt: new Date(),
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
        console.error("Create book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create book",
        });
    }
});

// =====================================
// UPDATE BOOK
// PATCH /books/:id
// =====================================

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

        const result = await db.collection("books").updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: {
                    ...req.body,
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

        res.status(200).json({
            success: true,
            message: "Book updated successfully",
        });
    } catch (error) {
        console.error("Update book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update book",
        });
    }
});

// =====================================
// DELETE BOOK
// DELETE /books/:id
// =====================================

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
        console.error("Delete book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete book",
        });
    }
});

module.exports = router;