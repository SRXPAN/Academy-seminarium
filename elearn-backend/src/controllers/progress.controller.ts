import type { Request, Response } from 'express'
import { AppError } from '../utils/AppError.js'
import { ok } from '../utils/response.js'
import { updateLectureProgress, getCourseProgress } from '../services/progress.service.js'

export async function updateProgressHandler(req: Request, res: Response) {
  const user = req.user
  if (!user) throw AppError.unauthorized('Unauthorized')

  const { lectureId } = req.params
  const { watchedSec, isCompleted } = req.body as { watchedSec: number; isCompleted: boolean }

  if (typeof lectureId !== 'string') {
    throw AppError.badRequest('Invalid lectureId')
  }

  if (watchedSec === undefined || isCompleted === undefined) {
    throw AppError.badRequest('watchedSec and isCompleted are required')
  }

  const progress = await updateLectureProgress(user.id, lectureId, watchedSec, isCompleted)

  return ok(res, progress)
}

export async function getCourseProgressHandler(req: Request, res: Response) {
  const user = req.user
  if (!user) throw AppError.unauthorized('Unauthorized')

  const { courseId } = req.params
  if (typeof courseId !== 'string') {
    throw AppError.badRequest('Invalid courseId')
  }

  const progress = await getCourseProgress(user.id, courseId)

  return ok(res, progress)
}
