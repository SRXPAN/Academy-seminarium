import type { Request, Response } from 'express'
import { AppError } from '../utils/AppError.js'
import { ok } from '../utils/response.js'
import { createOrUpdateReview } from '../services/reviews.service.js'

export async function createReviewHandler(req: Request, res: Response) {
  const user = req.user
  if (!user) throw AppError.unauthorized('Unauthorized')

  const { courseId, rating, comment } = req.body as { courseId: string; rating: number; comment?: string }

  if (!courseId || rating === undefined) {
    throw AppError.badRequest('courseId and rating are required')
  }

  const review = await createOrUpdateReview(user.id, { courseId, rating, comment })

  return ok(res, review)
}
