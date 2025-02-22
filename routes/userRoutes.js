import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // For authentication token
import userModel from "../models/userModel.js";
import dotenv from "dotenv";
import { authenticateToken, isAdmin } from "../middleware/authmiddleware.js";
import uploadImage from "../middleware/uploadImg.js";
import multer from 'multer';

// Set up multer to limit the file size
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  storage: multer.memoryStorage()  // Store file in memory (you can change to diskStorage if needed)
});

dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

/* -------------------- 📝 Register User -------------------- */
router.post("/register", async (req, res) => {
  try {
    const { username, email ,password } = req.body;
    console.log(username,email,password)
    if (!username || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "All fields are required.",
      });
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User already registered, please login.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await new userModel({
      username,
      password: hashedPassword,
      email,
    }).save();
    res.status(201).send({
      success: true,
      message: "User registered successfully.",
      user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in registration.",
      error: error.message,
    });
  }
});

router.get("/check/:username", async (req, res) => {
  try {
    const result = await userModel.findOne({ username: req.params.username });
    if (result) {
      return res.json({ Status: true });
    } else {
      return res.json({ Status: false });
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id,username:user.username,role:user.role }, JWT_SECRET, {
      expiresIn: "1d", // Token expires in 1 hour
    });

    res.status(200).send({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error during login.",
      error: error.message,
    });
  }
});

/* -------------------- 📝 Update User -------------------- */
router.put("/update/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { password, email, profilePhoto, bio, socialLinks } = req.body;

    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle password update
    if (password) {
      user.password = await bcrypt.hash(password, 7);
    }

    // Handle email update
    if (email) {
      user.email = email;
    }

    // Handle bio update
    if (bio) {
      user.bio = bio;
    }

    // Handle socialLinks update
    if (socialLinks) {
      user.socialLinks = { ...user.socialLinks.toObject(), ...socialLinks }; // Merge old and new social links
    }

    // Handle profile photo update
    if (profilePhoto) {
      try {
        const result = await uploadImage(profilePhoto);
        user.profilePhoto = result; // result should now be a URL or file path
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Error uploading profile photo",
          error: uploadError.message,
        });
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        socialLinks: user.socialLinks,
      }
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
});


/* -------------------- 🗑️ Delete User -------------------- */
router.delete("/delete/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await userModel.findOneAndDelete({ username });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "User deleted successfully.",
      user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting user.",
      error: error.message,
    });
  }
});
router.get("/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "User fetched successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto:user.profilePhoto,
        images:user.images,
        bio:user.bio,
        role:user.role,
        socialLinks: user.socialLinks,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching user data.",
      error: error.message,
    });
  }
});
router.get("/auther/:id", async (req, res) => {
  try {
    const { id } = req.params; // Use 'id' instead of 'userId'

    const user = await userModel.findById(id); // Pass ID directly
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User nottt found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "User fetched successfully.",
      user: {
        username: user.username,
         // Add profile photo if available
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching user data.",
      error: error.message,
    });
  }
});

router.post("/upload-image", authenticateToken, async (req, res) => {
  try {
    const { images } = req.body; // Expecting an array of base64 images

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const userId = req.user.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload each image to Cloudinary
    const uploadedImageUrls = await Promise.all(images.map(uploadImage));

    // Save uploaded images to user's profile
    user.images.push(...uploadedImageUrls);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: uploadedImageUrls,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ message: "Error uploading images", error: error.message });
  }
});



export default router;
