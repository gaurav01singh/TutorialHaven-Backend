import express from "express";
import connectDB from "../config/db.js";
import dotenv from "dotenv";
import userRoutes from "../routes/userRoutes.js"; 
import blogRoutes from "../routes/blogRoutes.js"; 
import categoryRoutes from "../routes/categoryRoutes.js"
import cors from "cors";



const Port = process.env.PORT || 5000;
connectDB();

dotenv.config();
const app = express();

app.use(cors()); 

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit:100000}));


app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/user", userRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/category", categoryRoutes);

app.listen(Port, () => {
  console.log(`App running on http://localhost:${Port}`);
});
