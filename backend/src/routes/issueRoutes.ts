import { Router } from 'express';
import { getIssues, updateIssue } from '../controllers/issueController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAdminAuth, getIssues);
router.patch('/:id', requireAdminAuth, updateIssue);

export default router;
