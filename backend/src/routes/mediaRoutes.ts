import { Router } from 'express';
import { getMedia, uploadMedia, deleteMedia } from '../controllers/mediaController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', getMedia);
router.post('/', requireAdminAuth, upload.single('file'), uploadMedia);
router.delete('/', requireAdminAuth, deleteMedia);

export default router;
