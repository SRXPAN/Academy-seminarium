import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { updateProgressHandler, getCourseProgressHandler } from '../controllers/progress.controller.js'

const router = Router()

// GET /api/progress/course/:courseId
router.get(
  '/course/:courseId',
  requireAuth,
  requireRole(['STUDENT', 'INSTRUCTOR', 'ADMIN']),
  asyncHandler(getCourseProgressHandler)
)

// PUT /api/progress/:lectureId
router.put(
  '/:lectureId',
  requireAuth,
  requireRole(['STUDENT']),
  asyncHandler(updateProgressHandler)
)

export default router
