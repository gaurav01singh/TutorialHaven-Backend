import mongoose from "mongoose";
import dns from "node:dns";

// Use public DNS when the system resolver cannot resolve MongoDB SRV records.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL environment variable is not configured");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 8000,
    })
      .then((connection) => {
        console.log(`connected ${connection.connection.host}`);
        return connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;