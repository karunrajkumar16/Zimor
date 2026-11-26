import { Router } from 'express';
import {
  getVisualMedia,
  getHomepageMedia,
  uploadVisualMedia,
  updateVisualMedia,
  resetVisualMedia,
} from '../controllers/visualMediaController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', getVisualMedia);
router.get('/homepage', getHomepageMedia);
router.post('/upload', requireAdminAuth, upload.single('file'), uploadVisualMedia);
router.put('/:id', requireAdminAuth, updateVisualMedia);
router.post('/reset', requireAdminAuth, resetVisualMedia);

export default router;
