const { MongoClient } = require("mongodb");

const uri = `mongodb+srv://${encodeURIComponent(
    process.env.DB_USER
)}:${encodeURIComponent(
    process.env.DB_PASS
)}@cluster0.cdz9cop.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


if (!uri) {
    throw new Error("❌ MONGODB URI is not defined");
}

const client = new MongoClient(uri);

let db = null;
let connectionPromise = null;

const connectDB = async () => {
    // Already connected
    if (db) {
        return db;
    }

    // Connection already in progress
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = client
        .connect()
        .then(() => {
            console.log("✅ MongoDB connected");

            db = client.db("dhawaPublication");

            return db;
        })
        .catch((error) => {
            connectionPromise = null;

            console.error("❌ MongoDB connection failed:", error);

            throw error;
        });

    return connectionPromise;
};

const getDB = () => {
    if (!db) {
        throw new Error("❌ Database is not connected");
    }

    return db;
};

module.exports = {
    connectDB,
    getDB,
};