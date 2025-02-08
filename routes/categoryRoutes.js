import express from "express";
import categoryModel from "../models/categoryModel.js";
import uploadImage from "../middleware/uploadImg.js"; // Make sure this handles the image upload properly
import blogModel from "../models/blogModel.js";
import { authenticateToken } from "../middleware/authmiddleware.js";

const router = express.Router();

// Route to create a new category
router.post("/create-category", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const existingCategory = await categoryModel.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists." });
    }

    const newCategory = new categoryModel({ name: name.trim() });

    // Upload image if provided
    // if (categoryPhoto) {
    //   const result = await uploadImage(categoryPhoto);
    //   newCategory.categoryPhoto = result;
    // }

    await newCategory.save();

    res.status(201).json({
      message: "Category created successfully.",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Route to get all categories
router.get("/get-category", async (req, res) => {
  try {
    const categories = await categoryModel.find();
    if (!categories.length) {
      return res.status(404).json({ message: "No categories found." });
    }
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
});
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogModel.find({ categories: { $in: [id] } });

    if (!blog || blog.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error: error.message });
  }
});


export default router;
