import { Router } from 'express';
import {
  getMedia,
  uploadMedia,
  deleteMedia,
  getUploadSignature,
  registerUploadedMedia,
} from '../controllers/mediaController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', getMedia);
router.post('/sign-upload', requireAdminAuth, getUploadSignature);
router.post('/register', requireAdminAuth, registerUploadedMedia);
router.post('/', requireAdminAuth, upload.single('file'), uploadMedia);
router.delete('/', requireAdminAuth, deleteMedia);

export default router;
