import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createReviewHandler } from '../controllers/reviews.controller.js';
const router = Router();
// POST /api/reviews
router.post('/', requireAuth, requireRole(['STUDENT']), asyncHandler(createReviewHandler));
export default router;
