const express = require("express");
const { getDB } = require("../config/db");

const router = express.Router();

router.get("/stats", async (req, res) => {
    try {
        const db = getDB();

        const totalBooks = await db
            .collection("books")
            .countDocuments();

        const totalOrders = await db
            .collection("orders")
            .countDocuments();

        const totalUsers = await db
            .collection("users")
            .countDocuments();

        const totalReviews = await db
            .collection("reviews")
            .countDocuments();

        res.status(200).json({
            totalBooks,
            totalOrders,
            totalUsers,
            totalReviews,
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard statistics",
        });
    }
});

module.exports = router;