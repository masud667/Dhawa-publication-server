const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { protect, adminOnly, validateOrder } = require("../middleware/auth");

const router = express.Router();

// ======================================================
// GET ALL ORDERS (Admin Only)
// GET /orders
// ======================================================
router.get("/", protect, adminOnly, async (req, res) => {
    try {
        const db = getDB();

        const orders = await db
            .collection("orders")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("❌ Get orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get orders",
        });
    }
});

// ======================================================
// GET RECENT ORDERS (Admin Only)
// GET /orders/recent
// Note: Must be defined BEFORE /orders/:id to prevent URL collision
// ======================================================
router.get("/recent", protect, adminOnly, async (req, res) => {
    try {
        const db = getDB();

        const recentOrders = await db
            .collection("orders")
            .find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        res.status(200).json({
            success: true,
            orders: recentOrders,
        });
    } catch (error) {
        console.error("❌ Get recent orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch recent orders",
        });
    }
});

// ======================================================
// GET ORDERS BY USER EMAIL
// GET /orders/user/:email
// Note: Must be defined BEFORE /orders/:id
// ======================================================
router.get("/user/:email", protect, async (req, res) => {
    try {
        const db = getDB();
        const { email } = req.params;

        // Ensure users can only query their own orders unless they are an admin
        if (req.user.role !== "admin" && req.user.email !== email) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Cannot fetch orders for other users",
            });
        }

        const orders = await db
            .collection("orders")
            .find({ email })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("❌ Get user orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get user orders",
        });
    }
});

// ======================================================
// GET SINGLE ORDER BY ID
// GET /orders/:id
// ======================================================
router.get("/:id", protect, async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await db.collection("orders").findOne({
            _id: new ObjectId(id),
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Restrict view if order doesn't belong to logged-in user and not admin
        if (req.user.role !== "admin" && req.user.email !== order.email) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Not authorized to view this order",
            });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("❌ Get single order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get order",
        });
    }
});

// ======================================================
// CREATE ORDER
// POST /orders
// ======================================================
router.post("/", validateOrder, async (req, res) => {
    try {
        const db = getDB();
        const orderData = req.body;

        const newOrder = {
            ...orderData,
            status: orderData.status || "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("orders").insertOne(newOrder);

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            orderId: result.insertedId,
        });
    } catch (error) {
        console.error("❌ Create order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
});

// ======================================================
// UPDATE ENTIRE ORDER (Admin Only)
// PATCH /orders/:id
// ======================================================
router.patch("/:id", protect, adminOnly, async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const updateData = {
            ...req.body,
            updatedAt: new Date(),
        };

        delete updateData._id;

        const result = await db.collection("orders").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
        });
    } catch (error) {
        console.error("❌ Update order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update order",
        });
    }
});

// ======================================================
// UPDATE ORDER STATUS ONLY (Admin Only)
// PATCH /orders/:id/status
// ======================================================
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { status } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Order status is required",
            });
        }

        const result = await db.collection("orders").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
        });
    } catch (error) {
        console.error("❌ Update order status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update order status",
        });
    }
});

// ======================================================
// DELETE ORDER (Admin Only)
// DELETE /orders/:id
// ======================================================
router.delete("/:id", protect, adminOnly, async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const result = await db.collection("orders").deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order deleted successfully",
        });
    } catch (error) {
        console.error("❌ Delete order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete order",
        });
    }
});

module.exports = router;