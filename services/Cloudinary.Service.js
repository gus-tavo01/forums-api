const cloudinary = require('cloudinary').v2;

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  uploadImage = async (image, folder) => {
    try {
      const prefix = process.env.CLOUDINARY_ASSET_PREFIX;

      const uploadResponse = await cloudinary.uploader.upload(image, {
        upload_preset: `${prefix}_${folder}`,
      });
      return uploadResponse.public_id;
    } catch (error) {
      return null;
    }
  };
}

module.exports = CloudinaryService;
