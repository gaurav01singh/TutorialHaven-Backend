import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    bio:{
      type:String,
    },
    socialLinks: {
      type: Map,
      of: String, // This allows you to store key-value pairs like { "twitter": "url", "linkedin": "url" }
      default: {},
    },
    
    profilePhoto: {
      type: String,
      default: "https://res.cloudinary.com/dyl5ibyvg/image/upload/v1738470373/cvs7bxhguhodci5vh02z.png", // Default profile photo URL
    },
    images: [{ type: String }], 
  },
  {
    timestamps: true,
  }
);

// Export the model
export default mongoose.model("User", userSchema);