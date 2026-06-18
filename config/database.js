const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'myDB';

let client;
let db;

async function connectDB() {
    try {
        if (!client) {
            client = new MongoClient(uri);
            await client.connect();
            db = client.db(dbName);
            console.log('Connected to MongoDB successfully');
        }
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return db;
}

module.exports = { connectDB, getDB };

