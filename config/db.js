import mongoose from "mongoose";
import dns from "node:dns";

// Use public DNS to prevent querySrv ECONNREFUSED on local network DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(process.env.MONGO_URL);
    console.log(`connected ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default connectDB;