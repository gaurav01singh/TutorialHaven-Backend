import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"; 
import blogRoutes from "./routes/blogRoutes.js"; 
import categoryRoutes from "./routes/categoryRoutes.js";
import cors from "cors";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 100000 }));

app.get("/", (req, res) => {
  res.send("hello from Vercel!");
});

// API routes
app.use("/api/user", userRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/category", categoryRoutes);

// Export the app for Vercel
export default app;
