import { z } from 'zod'

export const courseLanguageSchema = z.enum(['UA', 'PL', 'EN'])

export const createCourse = z.object({
  title: z.string().trim().min(1).max(255),
  subtitle: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().min(1).max(10000),
  price: z.coerce.number().min(0),
  categoryId: z.string().cuid('Invalid category ID'),
  language: courseLanguageSchema,
}).strict()

export const updateCourse = createCourse
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one course field is required',
  })

export const courseIdParam = z.object({
  id: z.string().cuid('Invalid course ID'),
}).strict()

export const courseIdPathParam = z.object({
  courseId: z.string().cuid('Invalid course ID'),
}).strict()

export type CreateCourseInput = z.infer<typeof createCourse>
export type UpdateCourseInput = z.infer<typeof updateCourse>
export type CourseIdParamInput = z.infer<typeof courseIdParam>
export type CourseIdPathParamInput = z.infer<typeof courseIdPathParam>

export const courseSchemas = {
  createCourse,
  updateCourse,
  courseIdParam,
  courseIdPathParam,
}