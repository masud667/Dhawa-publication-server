const express = require("express");
const { ObjectId } = require("mongodb");

const { getDB } = require("../config/db");

const router = express.Router();

// GET ALL CATEGORIES
router.get("/", async (req, res) => {
    try {
        const db = getDB();

        const categories = await db
            .collection("categories")
            .find({})
            .sort({ name: 1 })
            .toArray();

        res.status(200).json(categories);
    } catch (error) {
        console.error("Get categories error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get categories",
        });
    }
});

// CREATE CATEGORY
router.post("/", async (req, res) => {
    try {
        const { name, slug, image } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const db = getDB();

        const existing = await db.collection("categories").findOne({
            name,
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        const category = {
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
            image: image || "",
            createdAt: new Date(),
        };

        const result = await db
            .collection("categories")
            .insertOne(category);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            insertedId: result.insertedId,
        });
    } catch (error) {
        console.error("Create category error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create category",
        });
    }
});

// UPDATE CATEGORY
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const db = getDB();

        const result = await db.collection("categories").updateOne(
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
                message: "Category not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
        });
    } catch (error) {
        console.error("Update category error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update category",
        });
    }
});

// DELETE CATEGORY
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const db = getDB();

        const result = await db.collection("categories").deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("Delete category error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete category",
        });
    }
});

module.exports = router;