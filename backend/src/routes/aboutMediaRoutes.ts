import { Router } from 'express';
import {
  getAboutMedia,
  uploadAboutMedia,
  updateAboutMedia,
  resetAboutMedia,
} from '../controllers/aboutMediaController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', getAboutMedia);
router.post('/upload', requireAdminAuth, upload.single('file'), uploadAboutMedia);
router.put('/:section', requireAdminAuth, updateAboutMedia);
router.post('/reset', requireAdminAuth, resetAboutMedia);

export default router;
