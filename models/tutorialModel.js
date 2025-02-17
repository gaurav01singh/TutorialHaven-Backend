import mongoose from "mongoose";

const tutorialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
    sections: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Tutorial", tutorialSchema);
