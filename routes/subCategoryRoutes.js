// routes/subcategoryRoute.js
import express from "express";
import Subcategory from "../models/subCategoryModel.js";
import { authenticateToken, isAdmin } from "../middleware/authmiddleware.js";

const router = express.Router();

// Create Subcategory
router.post("/create", authenticateToken, isAdmin, async (req, res) => {
  try {
    const subcategory = new Subcategory(req.body);
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

