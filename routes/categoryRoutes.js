import express from "express";
import categoryModel from "../models/categoryModel.js";
import { authenticateToken, isAdmin } from "../middleware/authmiddleware.js";
import Subcategory from "../models/subCategoryModel.js";
import blogModel from "../models/blogModel.js";

const router = express.Router();

// 🟢 Create a new category
router.post("/create-category", authenticateToken,isAdmin, async (req, res) => {
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

// 🟡 Get all categories
router.get("/get-category", async (req, res) => {
  try {
    const categories = await categoryModel.find().lean();
    const subcategories = await Subcategory.find().lean();

    // Map subcategories to their respective categories
    const categoriesWithSubcategories = categories.map((category) => {
      return {
        ...category,
        subcategories: subcategories.filter((sub) => sub.category.toString() === category._id.toString()),
      };
    });

    res.json(categoriesWithSubcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔵 Get a single category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error: error.message });
  }
});
router.get("/blog/:id", async (req, res) => {
  try {
    const blogs = await blogModel.find({ categories: req.params.id });
    if (!blogs) {
      return res.status(404).json({ message: "blogs not found." });
    }
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error: error.message });
  }
});

// 🟠 Update category by ID
router.put("/update-category/:id", authenticateToken,isAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    res.status(200).json({ message: "Category updated successfully.", category: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error: error.message });
  }
});

// 🔴 Delete category by ID
router.delete("/delete-category/:id", authenticateToken,isAdmin, async (req, res) => {
  try {
    const deletedCategory = await categoryModel.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error: error.message });
  }
});

export default router;
