import type { Request, Response } from 'express'
import { AppError } from '../utils/AppError.js'
import { created } from '../utils/response.js'
import type { CreateLectureInput, CreateSectionInput } from '@elearn/shared'
import { createLecture as createLectureService, createSection as createSectionService } from '../services/courses.service.js'

function normalizeParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param
}

export async function createSection(req: Request, res: Response) {
  const user = req.user
  if (!user) {
    throw AppError.unauthorized('Unauthorized')
  }

  const body = req.body as CreateSectionInput

  const section = await createSectionService({ id: user.id, role: user.role }, normalizeParam(req.params.courseId), body)

  return created(res, section)
}

export async function createLecture(req: Request, res: Response) {
  const user = req.user
  if (!user) {
    throw AppError.unauthorized('Unauthorized')
  }

  const body = req.body as CreateLectureInput

  const lecture = await createLectureService({ id: user.id, role: user.role }, normalizeParam(req.params.sectionId), body)

  return created(res, lecture)
}