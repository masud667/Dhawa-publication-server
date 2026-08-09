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

        // Validate MongoDB ID
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID",
            });
        }

        const db = getDB();

        // Copy request body
        const updateData = { ...req.body };

        // VERY IMPORTANT:
        // Never update MongoDB _id
        delete updateData._id;

        // Also don't allow these to be changed accidentally
        delete updateData.createdAt;

        // Convert numeric fields
        if (updateData.price !== undefined) {
            updateData.price = Number(updateData.price);
        }

        if (updateData.discountPrice !== undefined) {
            updateData.discountPrice = Number(updateData.discountPrice);
        }

        if (updateData.rating !== undefined) {
            updateData.rating = Number(updateData.rating);
        }

        if (updateData.totalReviews !== undefined) {
            updateData.totalReviews = Number(updateData.totalReviews);
        }

        if (updateData.stock !== undefined) {
            updateData.stock = Number(updateData.stock);
        }

        if (updateData.sold !== undefined) {
            updateData.sold = Number(updateData.sold);
        }

        if (updateData.pages !== undefined) {
            updateData.pages = Number(updateData.pages);
        }

        // Update timestamp
        updateData.updatedAt = new Date();

        const result = await db.collection("books").updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: updateData,
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
            modifiedCount: result.modifiedCount,
        });

    } catch (error) {
        console.error("❌ Update book error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update book",
            error: error.message,
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

        console.log("DELETE BOOK ID:", id);

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

        console.log("DELETE RESULT:", result);

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found in database",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Book deleted successfully",
            deletedId: id,
        });
    } catch (error) {
        console.error("DELETE BOOK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete book",
            error: error.message,
        });
    }
});

module.exports = router;