import mongoose from "mongoose";

const subSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  subSections: [subSectionSchema], // Array of sub-sections
});

const tutorialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
    sections: [sectionSchema], // Array of sections with sub-sections
  },
  { timestamps: true }
);

export default mongoose.model("Tutorial", tutorialSchema);
