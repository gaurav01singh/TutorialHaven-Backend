import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"; 
import blogRoutes from "./routes/blogRoutes.js"; 
import categoryRoutes from "./routes/categoryRoutes.js";    
import subCategoryRoutes from "./routes/subCategoryRoutes.js";    
import tutorialRoutes from "./routes/tutorialRoutes.js";    
import cors from "cors";
import cookieParser from "cookie-parser";


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use(
  cors({origin:"https://tutorial-haven-backend.vercel.app/api/tutorial/all"})
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 100000 }));

app.get("/", (req, res) => {
  res.send("hello from Vercel!");
});

// API routes
app.use("/api/user", userRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subCategory", subCategoryRoutes);
app.use("/api/tutorial", tutorialRoutes);

// Export the app for Vercel
app.listen(process.env.PORT, () => {
  console.log(`App running on http://localhost:${process.env.PORT}`);
});

export default app;