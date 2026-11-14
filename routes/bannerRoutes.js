const express = require("express");
const { getDB } = require("../config/db");

const router = express.Router();

// GET /preorder
router.get("/preorder", async (req, res) => {
    try {
        const db = getDB();
        let banner = await db.collection("banners").findOne({ type: "preorder" });
        if (!banner) {
            banner = {
                type: "preorder",
                tag: "নতুন প্রি-অর্ডার চলছে",
                offerTag: "৫৫% ছাড়",
                title: "নমুনা বইয়ের নাম",
                author: "লেখকের নাম",
                description: "বইয়ের বিবরণ এখানে থাকবে...",
                bookCover: "https://via.placeholder.com/300x400",
                ctaText: "প্রি-অর্ডার করুন",
                ctaLink: "/pre-order",
            };
        }
        res.status(200).json({ success: true, banner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /preorder
router.put("/preorder", async (req, res) => {
    try {
        const db = getDB();
        const bannerData = req.body;
        delete bannerData._id;

        const updateData = {
            ...bannerData,
            type: "preorder",
            updatedAt: new Date(),
        };

        await db.collection("banners").updateOne(
            { type: "preorder" },
            { $set: updateData },
            { upsert: true }
        );

        const updatedBanner = await db.collection("banners").findOne({ type: "preorder" });
        res.status(200).json({ success: true, banner: updatedBanner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;