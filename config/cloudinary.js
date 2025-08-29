// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload helper
const uploadOnCloudinary = async (file) => {
  if (!file) return null;
  try {
    //setting the timeout limit
    const uploadResult = await cloudinary.uploader.upload(file, {
  resource_type: 'auto',
  timeout: 120000 // 2 minute
})

    return uploadResult.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  } finally {
    // File ko hamesha safely delete karo
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (e) {
      console.error('File delete error:', e.message);
    }
  }
};

export default uploadOnCloudinary;


