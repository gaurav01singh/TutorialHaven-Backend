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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
    templateImg: {
      type: String,
      default: "https://res.cloudinary.com/dyl5ibyvg/image/upload/v1740068312/vtcnrrvoifqpwtzdhco5.png",
    },
    sections: [sectionSchema], // Array of sections with sub-sections
  },
  { timestamps: true }
);

export default mongoose.model("Tutorial", tutorialSchema);
