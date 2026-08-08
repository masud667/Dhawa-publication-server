const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${encodeURIComponent(
    process.env.DB_USER
)}:${encodeURIComponent(
    process.env.DB_PASS
)}@cluster0.cdz9cop.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let db;

const connectDB = async () => {
    try {
        await client.connect();

        await client.db("admin").command({
            ping: 1,
        });

        db = client.db("dhawaPublication");

        console.log("✅ MongoDB Connected");

        return db;
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        throw error;
    }
};

const getDB = () => {
    if (!db) {
        throw new Error("Database is not connected");
    }

    return db;
};

module.exports = {
    connectDB,
    getDB,
};