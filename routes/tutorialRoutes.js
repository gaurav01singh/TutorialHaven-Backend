// routes/tutorialRoute.js
import express from "express";
import tutorialModel from "../models/tutorialModel.js";
import { authenticateToken, isAdmin } from "../middleware/authmiddleware.js";

const router = express.Router();

// Create tutorialModel
router.post("/create", authenticateToken, isAdmin, async (req, res) => {
  try {
    const tutorial = new tutorialModel(req.body);
    await tutorial.save();
    res.status(201).json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/all", async (req, res) => {
  try {
    const tutorials = await tutorialModel.find();
    res.status(200).json(tutorials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tutorial", error: error.message });
  }
});
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tutorial = await tutorialModel.findById(id);
    if (!tutorial) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(tutorial);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error: error.message });
  }
});

// Get Tutorials by Subcategory
router.get("/subcategory/:subcategoryId", async (req, res) => {
  try {
    const tutorials = await tutorialModel.find({ subcategory: req.params.subcategoryId });
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update tutorialModel
router.put("/update/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const tutorial = await tutorialModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete tutorialModel
router.delete("/delete/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await tutorialModel.findByIdAndDelete(req.params.id);
    res.json({ message: "tutorialModel deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
