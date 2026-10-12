import mongoose from "mongoose";
import dns from "node:dns";

// Use public DNS when the system resolver cannot resolve MongoDB SRV records.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let mongoUri = (process.env.MONGO_URL || "").trim();
  if (
    (mongoUri.startsWith('"') && mongoUri.endsWith('"')) ||
    (mongoUri.startsWith("'") && mongoUri.endsWith("'"))
  ) {
    mongoUri = mongoUri.slice(1, -1).trim();
  }

  if (!mongoUri) {
    throw new Error("MONGO_URL environment variable is not configured");
  }

  const maskedUri = mongoUri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    })
      .then((connection) => {
        console.log(`Connected to MongoDB host: ${connection.connection.host}`);
        return connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error(`MongoDB connection error for ${maskedUri}:`, error.message);
        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;