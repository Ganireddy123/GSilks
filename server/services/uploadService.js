const cloudinary = require('cloudinary').v2;
const ApiError = require('../utils/ApiError');

const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

const ensureCloudinaryConfig = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length) {
    throw new ApiError(500, 'Image storage is not configured.', [`Missing environment variables: ${missing.join(', ')}`]);
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
};

const uploadProductImage = async (file) => {
  if (!file || !file.buffer || !file.buffer.length) {
    throw new ApiError(400, 'No valid image was provided.', ['Please choose a valid JPG, PNG, or WEBP image.']);
  }

  ensureCloudinaryConfig();

  const publicId = `gsilks-products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gsilks/products',
          public_id: publicId,
          resource_type: 'image',
          overwrite: false
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(uploadResult);
        }
      );

      uploadStream.end(file.buffer);
    });

    if (!result || !result.secure_url) {
      throw new ApiError(500, 'Image upload failed.', ['The uploaded image could not be stored.']);
    }

    return result.secure_url;
  } catch (error) {
    if (error && error.statusCode) {
      throw error;
    }

    throw new ApiError(500, 'Image upload failed.', ['The image could not be uploaded to the configured storage service.']);
  }
};

module.exports = {
  uploadProductImage
};
