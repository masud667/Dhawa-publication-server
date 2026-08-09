const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const router = express.Router();

// ======================================================
// GET ALL ORDERS
// GET /orders
// ======================================================

router.get("/", async (req, res) => {
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
// GET SINGLE ORDER
// GET /orders/:id
// ======================================================

router.get("/:id", async (req, res) => {
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
// GET ORDERS BY EMAIL
// GET /orders/user/:email
// ======================================================

router.get("/user/:email", async (req, res) => {
    try {
        const db = getDB();
        const { email } = req.params;

        const orders = await db
            .collection("orders")
            .find({
                email: email,
            })
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
// CREATE ORDER
// POST /orders
// ======================================================

router.post("/", async (req, res) => {
    try {
        const db = getDB();

        const orderData = req.body;

        // Basic validation
        if (!orderData.email) {
            return res.status(400).json({
                success: false,
                message: "Customer email is required",
            });
        }

        if (!orderData.items || !Array.isArray(orderData.items)) {
            return res.status(400).json({
                success: false,
                message: "Order items are required",
            });
        }

        const newOrder = {
            ...orderData,

            status: orderData.status || "pending",

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db
            .collection("orders")
            .insertOne(newOrder);

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
// UPDATE ORDER
// PATCH /orders/:id
// ======================================================

router.patch("/:id", async (req, res) => {
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

        // Prevent changing MongoDB _id
        delete updateData._id;

        const result = await db.collection("orders").updateOne(
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
// UPDATE ONLY ORDER STATUS
// PATCH /orders/:id/status
// ======================================================

router.patch("/:id/status", async (req, res) => {
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
            {
                _id: new ObjectId(id),
            },
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
// DELETE ORDER
// DELETE /orders/:id
// ======================================================

router.delete("/:id", async (req, res) => {
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