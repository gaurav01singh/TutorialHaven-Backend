import express from "express";
import Tutorial from "../models/tutorialModel.js";
import { authenticateToken, isAdmin } from "../middleware/authmiddleware.js";
import uploadImage from "../middleware/uploadImg.js";

const router = express.Router();

// ✅ Create a new tutorial
router.post("/create", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, category, subcategory, templateImg, sections } = req.body;
    if (!title || !category) {
      return res.status(400).json({ message: "Title, Category are required." });
    }
    const result = await uploadImage(templateImg);
    const tutorial = new Tutorial({ title, createdBy: req.user.id, category, subcategory, templateImg: result, sections, slug: title.toLowerCase().replace(/ /g, "-"), createdAt: new Date() });
    await tutorial.save();
    res.status(201).json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all tutorials
router.get("/all", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    res.set('Cache-Control', 'public, max-age=300');

    // Get total count for pagination info
    const totalCount = await Tutorial.countDocuments({});

    const tutorials = await Tutorial.find({}, 'title templateImg slug createdBy category createdAt')
      .populate("createdBy", "username email")
      .populate("category", "name")
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      tutorials,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching tutorials:", error);
    res.status(500).json({ message: "Error fetching tutorials", error: error.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20)); // Cap at 100
    const skip = (page - 1) * limit;

    // Set cache headers
    res.set('Cache-Control', 'public, max-age=300');

    // Filter by userId
    const query = userId ? { createdBy: userId } : {};

    // Execute queries in parallel for better performance
    const [tutorials, totalCount] = await Promise.all([
      Tutorial.find(query, 'title templateImg slug createdBy category createdAt')
        .populate("createdBy", "username email")
        .populate("category", "name")
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Tutorial.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Return structured response
    res.status(200).json({
      success: true,
      data: tutorials,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    });

  } catch (error) {
    console.error('Error fetching tutorials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutorials',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ✅ Get a single tutorial by ID
router.get("/:slug", async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ slug: req.params.slug }).populate("createdBy", "name email").populate("category", "name").populate("subcategory", "name");
    // console.log(tutorial);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });
    res.status(200).json(tutorial);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tutorial", error: error.message });
  }
});

// ✅ Get tutorials by subcategory
router.get("/subcategory/:subcategoryId", async (req, res) => {
  try {
    const tutorials = await Tutorial.find({ subcategory: req.params.subcategoryId }, 'title templateImg slug createdBy category').populate("category", "name");
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/category/:categoryId", async (req, res) => {
  try {
    const tutorials = await Tutorial.find({ category: req.params.categoryId }, 'title templateImg slug createdBy category');
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
