const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const router = express.Router();

// ======================================================
// GET ALL USERS
// GET /users
// ======================================================

router.get("/", async (req, res) => {
    try {
        const db = getDB();

        const users = await db
            .collection("users")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("❌ Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get users",
        });
    }
});

// ======================================================
// GET SINGLE USER
// GET /users/:id
// ======================================================

router.get("/:id", async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const user = await db.collection("users").findOne({
            _id: new ObjectId(id),
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("❌ Get user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get user",
        });
    }
});

// ======================================================
// GET USER BY EMAIL
// GET /users/email/:email
// ======================================================

router.get("/email/:email", async (req, res) => {
    try {
        const db = getDB();
        const { email } = req.params;

        const user = await db.collection("users").findOne({
            email: email,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("❌ Get user by email error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get user",
        });
    }
});

// ======================================================
// CREATE USER
// POST /users
// ======================================================

router.post("/", async (req, res) => {
    try {
        const db = getDB();

        const { name, email, photo } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check existing user
        const existingUser = await db.collection("users").findOne({
            email: email,
        });

        if (existingUser) {
            return res.status(200).json({
                success: true,
                message: "User already exists",
                user: existingUser,
            });
        }

        const newUser = {
            name: name || "",
            email,
            photo: photo || "",

            role: "customer",

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db
            .collection("users")
            .insertOne(newUser);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            userId: result.insertedId,
        });
    } catch (error) {
        console.error("❌ Create user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create user",
        });
    }
});

// ======================================================
// UPDATE USER
// PATCH /users/:id
// ======================================================

router.patch("/:id", async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const updateData = {
            ...req.body,
            updatedAt: new Date(),
        };

        // Never update MongoDB _id
        delete updateData._id;

        const result = await db.collection("users").updateOne(
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
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
        });
    } catch (error) {
        console.error("❌ Update user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user",
        });
    }
});

// ======================================================
// UPDATE USER ROLE
// PATCH /users/:id/role
// ======================================================

router.patch("/:id/role", async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { role } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Role is required",
            });
        }

        const allowedRoles = [
            "customer",
            "admin",
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
            });
        }

        const result = await db.collection("users").updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: {
                    role,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
        });
    } catch (error) {
        console.error("❌ Update user role error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user role",
        });
    }
});

// ======================================================
// DELETE USER
// DELETE /users/:id
// ======================================================

router.delete("/:id", async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const result = await db.collection("users").deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("❌ Delete user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete user",
        });
    }
});

module.exports = router;