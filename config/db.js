import mongoose from "mongoose";
import dns from "node:dns";

// Use public DNS to prevent querySrv ECONNREFUSED on local network DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URL);
      console.log(`connected ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
    }
  };
  
  export default connectDB;