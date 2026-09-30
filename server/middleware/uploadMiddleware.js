const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
    return;
  }

  cb(new ApiError(400, 'Only JPG, JPEG, PNG, and WEBP image files are allowed.'));
};

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  },
  fileFilter
});

uploadMiddleware.singleProductImage = (req, res, next) => {
  console.log('IMAGE UPLOAD START');
  console.log('CLOUDINARY CONFIG:', {
    cloud_name: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: Boolean(process.env.CLOUDINARY_API_KEY),
    api_secret: Boolean(process.env.CLOUDINARY_API_SECRET)
  });

  uploadMiddleware.single('image')(req, res, (error) => {
    if (error) return next(error);

    console.log('FILE RECEIVED:', req.file ? {
      fieldname: req.file.fieldname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      originalname: req.file.originalname
    } : null);
    return next();
  });
};

module.exports = uploadMiddleware;
