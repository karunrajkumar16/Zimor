import { Router } from 'express';
import { getContent, upsertContent } from '../controllers/contentController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:page', getContent);
router.put('/:page', requireAdminAuth, upsertContent);

export default router;
