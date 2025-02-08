import cloudinary from "../config/cloudinary.js";

const uploadImage = async (profilePhoto) => {
    try {
            // Logic to upload the photo (e.g., to Cloudinary)
            const cloudinaryResponse = await cloudinary.uploader.upload(profilePhoto,{width: 1280, height: 720, crop: "limit"});
            // console.log(cloudinaryResponse.url);
            return cloudinaryResponse.secure_url; 
          
       
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

export default uploadImage;