import express from "express";
import tutorialModel from "../models/tutorialModel.js";
import { authenticateToken, isAdmin } from "../middleware/authmiddleware.js";

const router = express.Router();

// ✅ Create a new tutorial with sub-sections
router.post("/create", authenticateToken, isAdmin, async (req, res) => {
  try {
    const tutorial = new tutorialModel(req.body);
    await tutorial.save();
    res.status(201).json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all tutorials
router.get("/all", async (req, res) => {
  try {
    const tutorials = await tutorialModel.find();
    res.status(200).json(tutorials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tutorials", error: error.message });
  }
});

// ✅ Get a single tutorial by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const tutorial = await tutorialModel.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });
    res.status(200).json(tutorial);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tutorial", error: error.message });
  }
});

// ✅ Get tutorials by subcategory
router.get("/subcategory/:subcategoryId", async (req, res) => {
  try {
    const tutorials = await tutorialModel.find({ subcategory: req.params.subcategoryId });
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update a tutorial (including sections & sub-sections)
router.put("/update/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const tutorial = await tutorialModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a tutorial
router.delete("/delete/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await tutorialModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Tutorial deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Add a new section to an existing tutorial
router.put("/:id/add-section", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    const tutorial = await tutorialModel.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });

    tutorial.sections.push({ title, content, subSections: [] });
    await tutorial.save();
    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Add a sub-section to an existing section
router.put("/:tutorialId/section/:sectionIndex/add-subsection", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    const tutorial = await tutorialModel.findById(req.params.tutorialId);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });

    if (tutorial.sections[req.params.sectionIndex]) {
      tutorial.sections[req.params.sectionIndex].subSections.push({ title, content });
      await tutorial.save();
      res.json(tutorial);
    } else {
      res.status(404).json({ message: "Section not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a specific section
router.put("/:tutorialId/section/:sectionIndex/delete", authenticateToken, isAdmin, async (req, res) => {
  try {
    const tutorial = await tutorialModel.findById(req.params.tutorialId);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });

    tutorial.sections.splice(req.params.sectionIndex, 1);
    await tutorial.save();
    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a specific sub-section
router.put("/:tutorialId/section/:sectionIndex/subsection/:subSectionIndex/delete", authenticateToken, isAdmin, async (req, res) => {
  try {
    const tutorial = await tutorialModel.findById(req.params.tutorialId);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });

    if (tutorial.sections[req.params.sectionIndex]?.subSections[req.params.subSectionIndex]) {
      tutorial.sections[req.params.sectionIndex].subSections.splice(req.params.subSectionIndex, 1);
      await tutorial.save();
      res.json(tutorial);
    } else {
      res.status(404).json({ message: "Sub-section not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
