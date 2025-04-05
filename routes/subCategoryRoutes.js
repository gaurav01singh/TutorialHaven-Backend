// routes/subcategoryRoute.js
import express from "express";
import Subcategory from "../models/subCategoryModel.js";
import { authenticateToken, isAdmin } from "../middleware/authmiddleware.js";

const router = express.Router();

// Create Subcategory
router.post("/create", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required." });
    }
    const subcategory = new Subcategory({
      name,
      slug: name.toLowerCase().replace(/ /g, "-"),
      category,
    });
    await subcategory.save();
    res.status(201).json(subcategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Subcategories
router.get("/", async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate("category");
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/:slug", async (req, res) => {
  try {
    const category = await Subcategory.findOne({slug: req.params.slug}).populate("category").lean();
    
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error: error.message });
  }
});
// Update Subcategory
router.put("/update/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Subcategory
router.delete("/delete/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await Subcategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Subcategory deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

