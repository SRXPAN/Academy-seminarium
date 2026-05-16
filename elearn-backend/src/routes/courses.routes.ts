import { Router } from 'express'
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { validateResource } from '../middleware/validateResource.js'
import { createCourse as createCourseSchema, courseIdParam, updateCourse as updateCourseSchema } from '@elearn/shared'
import { 
  createCourse, 
  getCourseById, 
  getMyCourses, 
  getPublishedCourses, 
  updateCourse,
  getEnrolledCourses 
} from '../controllers/courses.controller.js'

const router = Router()

router.get(
  '/mine',
  requireAuth,
  requireRole(['INSTRUCTOR', 'ADMIN']),
  asyncHandler(getMyCourses)
)

router.get(
  '/enrolled',
  requireAuth,
  requireRole(['STUDENT', 'INSTRUCTOR', 'ADMIN']),
  asyncHandler(getEnrolledCourses)
)

router.get(
  '/',
  asyncHandler(getPublishedCourses)
)

router.post(
  '/',
  requireAuth,
  requireRole(['INSTRUCTOR', 'ADMIN']),
  validateResource(createCourseSchema, 'body'),
  asyncHandler(createCourse)
)

router.get(
  '/:id',
  optionalAuth,
  validateResource(courseIdParam, 'params'),
  asyncHandler(getCourseById)
)

router.put(
  '/:id',
  requireAuth,
  requireRole(['INSTRUCTOR', 'ADMIN']),
  validateResource(updateCourseSchema, 'body'),
  validateResource(courseIdParam, 'params'),
  asyncHandler(updateCourse)
)

export default router
