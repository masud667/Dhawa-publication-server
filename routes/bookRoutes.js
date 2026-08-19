const express = require("express");
const { getDB } = require("../config/db");

const router = express.Router();

// ======================================
// Helper
// ======================================

const getBooks = async (filter = {}) => {
    const db = getDB();

    return await db
        .collection("books")
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
};

// ======================================
// GET /home/banner
// ======================================

router.get("/banner", async (req, res) => {
    try {
        const db = getDB();

        const banners = await db
            .collection("banners")
            .find({
                status: "published",
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json(banners);
    } catch (error) {
        console.error("❌ Banner API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get banners",
            error: error.message,
        });
    }
});

// ======================================
// GET /home/recent-books
// ======================================

router.get("/recent-books", async (req, res) => {
    try {
        const books = await getBooks({
            recent: true,
            status: "published",
        });

        res.status(200).json(books);
    } catch (error) {
        console.error("❌ Recent books API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get recent books",
            error: error.message,
        });
    }
});

// ======================================
// GET /home/featured-books
// ======================================

router.get("/featured-books", async (req, res) => {
    try {
        const books = await getBooks({
            featured: true,
            status: "published",
        });

        res.status(200).json(books);
    } catch (error) {
        console.error("❌ Featured books API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get featured books",
            error: error.message,
        });
    }
});

// ======================================
// GET /home/best-seller
// ======================================

router.get("/best-seller", async (req, res) => {
    try {
        const books = await getBooks({
            bestSeller: true,
            status: "published",
        });

        res.status(200).json(books);
    } catch (error) {
        console.error("❌ Best seller API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get best seller books",
            error: error.message,
        });
    }
});

// ======================================
// GET /home/popular
// ======================================

router.get("/popular", async (req, res) => {
    try {
        const books = await getBooks({
            popular: true,
            status: "published",
        });

        res.status(200).json(books);
    } catch (error) {
        console.error("❌ Popular books API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get popular books",
            error: error.message,
        });
    }
});

// ======================================
// GET /home/muslim-life
// ======================================

router.get("/muslim-life", async (req, res) => {
    try {
        const books = await getBooks({
            section: "মুসলিম জীবন রচিত",
            status: "published",
        });

        res.status(200).json(books);
    } catch (error) {
        console.error("❌ Muslim life API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get Muslim life books",
            error: error.message,
        });
    }
});

// ======================================
// GET /home/women
// ======================================

router.get("/women", async (req, res) => {
    try {
        const books = await getBooks({
            section: "নারীদের নির্বাচিত বই",
            status: "published",
        });

        res.status(200).json(books);
    } catch (error) {
        console.error("❌ Women books API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get women books",
            error: error.message,
        });
    }
});

// ======================================
// GET /home/self-purification
// ======================================

router.get("/self-purification", async (req, res) => {
    try {
        const books = await getBooks({
            section: "আমল ও আত্মশুদ্ধির বই",
            status: "published",
        });

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
        const books = await getBooks({
            section: "তালীমের বই",
            status: "published",
        });

        res.status(200).json(books);
    } catch (error) {
        console.error("❌ Talim API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get Talim books",
            error: error.message,
        });
    }
});

// ======================================
// GET /home/children
// ======================================

router.get("/children", async (req, res) => {
    try {
        const books = await getBooks({
            section: "ছোটদের প্রিয় বই",
            status: "published",
        });

        res.status(200).json(books);
    } catch (error) {
        console.error("❌ Children books API error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get children books",
            error: error.message,
        });
    }
});

module.exports = router;