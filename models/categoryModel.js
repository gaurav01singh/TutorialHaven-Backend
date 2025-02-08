// category.js

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    // categoryPhoto: {
    //   type: String,
    //   default: "https://res.cloudinary.com/dyl5ibyvg/image/upload/v1738470373/cvs7bxhguhodci5vh02z.png", // Default profile photo URL
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Category", categorySchema);
