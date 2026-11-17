import multer from 'multer';

// Use memory storage for buffer access in Cloudinary & Local media providers
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for high-res images & video reels
  },
});
