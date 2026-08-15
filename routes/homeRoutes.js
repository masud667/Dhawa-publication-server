const express = require("express");
const { getDB } = require("../config/db");

const router = express.Router();

// ======================================
// GET /home/banner
// ======================================

router.get("/banner", async (req, res) => {
    try {
        const db = getDB();

        const banners = await db
            .collection("banners")
            .find({ status: "published" })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json(banners);
    } catch (error) {
        console.error("Banner API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get banners",
        });
    }
});

// ======================================
// GET /home/recent-books
// ======================================

router.get("/recent-books", async (req, res) => {
    try {
        const db = getDB();

        const books = await db
            .collection("books")
            .find({
                recent: true,
                status: "published",
            })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        res.status(200).json(books);
    } catch (error) {
        console.error("Recent books API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get recent books",
        });
    }
});

// ======================================
// GET /home/featured-books
// ======================================

router.get("/featured-books", async (req, res) => {
    try {
        const db = getDB();

        const books = await db
            .collection("books")
            .find({
                featured: true,
                status: "published",
            })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        res.status(200).json(books);
    } catch (error) {
        console.error("Featured books API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get featured books",
        });
    }
});

// ======================================
// GET /home/best-seller
// ======================================

router.get("/best-seller", async (req, res) => {
    try {
        const db = getDB();

        const books = await db
            .collection("books")
            .find({
                bestSeller: true,
                status: "published",
            })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        res.status(200).json(books);
    } catch (error) {
        console.error("Best seller API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get best seller books",
        });
    }
});

// ======================================
// GET /home/popular
// ======================================

router.get("/popular", async (req, res) => {
    try {
        const db = getDB();

        const books = await db
            .collection("books")
            .find({
                popular: true,
                status: "published",
            })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        res.status(200).json(books);
    } catch (error) {
        console.error("Popular books API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get popular books",
        });
    }
});

// ======================================
// GET /home/muslim-life
// ======================================

router.get("/muslim-life", async (req, res) => {
    try {
        const db = getDB();

        const books = await db
            .collection("books")
            .find({
                section: "মুসলিম জীবন রচিত",
                status: "published",
            })
            .limit(10)
            .toArray();

        res.status(200).json(books);
    } catch (error) {
        console.error("Muslim life API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get Muslim life books",
        });
    }
});

// ======================================
// GET /home/women
// ======================================

router.get("/women", async (req, res) => {
    try {
        const db = getDB();

        const books = await db
            .collection("books")
            .find({
                section: "নারীদের নির্বাচিত বই",
                status: "published",
            })
            .limit(10)
            .toArray();

        res.status(200).json(books);
    } catch (error) {
        console.error("Women books API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get women books",
        });
    }
});

// ======================================
// GET /home/self-purification
// ======================================
router.get("/self-purification", async (req, res) => {
    try {
        const db = getDB();

        const books = await db
            .collection("books")
            .find({
                section: "আমল ও আত্মশুদ্ধির বই",
                status: "published",
            })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        res.status(200).json(books);
    } catch (error) {
        console.error("❌ Self purification API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get self purification books",
            error: error.message,
        });
    }
});
// ======================================
// GET /home/talim
// ======================================

router.get("/talim", async (req, res) => {
    try {
        const db = getDB();

        const books = await db
            .collection("books")
            .find({
                section: "তালীমের বই",
                status: "published",
            })
            .limit(10)
            .toArray();

        res.status(200).json(books);
    } catch (error) {
        console.error("Talim API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get Talim books",
        });
    }
});

// ======================================
// GET /home/children
// ======================================

router.get("/children", async (req, res) => {
    try {
        const db = getDB();

        const books = await db
            .collection("books")
            .find({
                section: "ছোটদের প্রিয় বই",
                status: "published",
            })
            .limit(10)
            .toArray();

        res.status(200).json(books);
    } catch (error) {
        console.error("Children books API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get children books",
        });
    }
});

module.exports = router;