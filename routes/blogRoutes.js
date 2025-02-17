import express from "express";
import Blog from "../models/blogModel.js"; 
import { authenticateToken, isAdmin } from "../middleware/authmiddleware.js";
import categoryModel from "../models/categoryModel.js";

const router = express.Router();

// Create a new blog
router.post("/create",authenticateToken,isAdmin, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // Validate if categories exist
    const categoryExists = await categoryModel.find({ '_id': { $in: category } });
    if (!categoryExists.length) {
      return res.status(400).json({ message: "One or more categories do not exist." });
    }

    const newBlog = new Blog({
      title,
      description,
      createdBy:req.user.id,
      categories:category, // An array of category IDs
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error creating blog", error });
  }
});

// Update a blog by ID
router.put("/update/:id", authenticateToken,isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Error updating blog", error: error.message });
  }
});

// Delete a blog by ID
router.delete("/delete/:id", authenticateToken,isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error: error.message });
  }
});

// Get all blogs
router.get("/all", authenticateToken, async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error: error.message });
  }
});

// Get a blog by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error: error.message });
  }
});
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const blogs = await Blog.find({ createdBy: req.params.userId });
    if (!blogs) {
      return res.status(404).json({ message: "No blogs found." });
    }
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


export default router;
