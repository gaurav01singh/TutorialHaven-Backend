import express from "express";
import Tutorial from "../models/tutorialModel.js";
import { authenticateToken, isAdmin } from "../middleware/authmiddleware.js";
import uploadImage from "../middleware/uploadImg.js";

const router = express.Router();

// ✅ Create a new tutorial
router.post("/create", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title,  category, subcategory, templateImg, sections } = req.body;
    if (!title  || !category) {
      return res.status(400).json({ message: "Title, Category are required." });
    }
    const result = await uploadImage(templateImg);
    const tutorial = new Tutorial({ title, createdBy:req.user.id, category, subcategory, templateImg: result, sections, slug: title.toLowerCase().replace(/ /g, "-") });
    await tutorial.save();
    res.status(201).json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all tutorials
router.get("/all", async (req, res) => {
  try {
    const tutorials = await Tutorial.find().populate("createdBy", "name email").populate("category", "name");
    res.status(200).json(tutorials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tutorials", error: error.message });
  }
});

// ✅ Get a single tutorial by ID
router.get("/:slug", async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({slug:req.params.slug}).populate("createdBy", "name email").populate("category", "name").populate("subcategory", "name");
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });
    res.status(200).json(tutorial);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tutorial", error: error.message });
  }
});

// ✅ Get tutorials by subcategory
router.get("/subcategory/:subcategoryId", async (req, res) => {
  try {
    const tutorials = await Tutorial.find({ subcategory: req.params.subcategoryId }).populate("category", "name");
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/category/:categoryId", async (req, res) => {
  try {
    const tutorials = await Tutorial.find({ category: req.params.categoryId });
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update a tutorial
router.put("/update/:slug", authenticateToken, isAdmin, async (req, res) => {
  try {
    const tutorial = await Tutorial.findOneAndUpdate({ slug: decodeURIComponent(req.params.slug) }, req.body, { new: true });
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });
    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a tutorial
router.delete("/delete/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndDelete(req.params.id);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });
    res.json({ message: "Tutorial deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Add a new section
router.put("/:id/add-section", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and Content are required." });

    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });

    tutorial.sections.push({ title, content, subSections: [] });
    await tutorial.save();
    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Add a sub-section
router.put("/:tutorialId/section/:sectionIndex/add-subsection", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and Content are required." });

    const tutorial = await Tutorial.findById(req.params.tutorialId);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });

    if (!tutorial.sections[req.params.sectionIndex]) {
      return res.status(404).json({ message: "Section not found" });
    }

    tutorial.sections[req.params.sectionIndex].subSections.push({ title, content });
    await tutorial.save();
    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a specific section
router.put("/:tutorialId/section/:sectionIndex/delete", authenticateToken, isAdmin, async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.tutorialId);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });

    if (!tutorial.sections[req.params.sectionIndex]) {
      return res.status(404).json({ message: "Section not found" });
    }

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
    const tutorial = await Tutorial.findById(req.params.tutorialId);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });

    if (!tutorial.sections[req.params.sectionIndex]?.subSections[req.params.subSectionIndex]) {
      return res.status(404).json({ message: "Sub-section not found" });
    }

    tutorial.sections[req.params.sectionIndex].subSections.splice(req.params.subSectionIndex, 1);
    await tutorial.save();
    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
