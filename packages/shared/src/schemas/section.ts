import { z } from 'zod'

export const createSection = z.object({
  title: z.string().trim().min(1).max(255),
  orderIndex: z.coerce.number().int().min(0),
}).strict()

export const sectionIdParam = z.object({
  sectionId: z.string().cuid('Invalid section ID'),
}).strict()

export type CreateSectionInput = z.infer<typeof createSection>
export type SectionIdParamInput = z.infer<typeof sectionIdParam>

export const sectionSchemas = {
  createSection,
  sectionIdParam,
}