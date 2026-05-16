import { z } from 'zod';
export const courseLanguageSchema = z.enum(['UA', 'PL', 'EN']);
export const createCourseSchema = z.object({
    title: z.string().min(1).max(255),
    subtitle: z.string().min(1).max(255).optional(),
    description: z.string().min(1),
    price: z.coerce.number().int().min(0),
    categoryId: z.string().min(1),
    language: courseLanguageSchema,
});
export const updateCourseSchema = createCourseSchema.partial();
export const courseIdParamSchema = z.object({
    id: z.string().cuid('Invalid course ID'),
});
export const courseIdPathParamSchema = z.object({
    courseId: z.string().cuid('Invalid course ID'),
});
export const sectionIdParamSchema = z.object({
    sectionId: z.string().cuid('Invalid section ID'),
});
export const createSectionSchema = z.object({
    title: z.string().min(1).max(255),
    orderIndex: z.coerce.number().int().min(0),
});
export const createLectureSchema = z.object({
    title: z.string().min(1).max(255),
    type: z.enum(['VIDEO', 'ARTICLE']),
    orderIndex: z.coerce.number().int().min(0),
});
export const courseSchemas = {
    create: createCourseSchema,
    update: updateCourseSchema,
    idParam: courseIdParamSchema,
    courseIdParam: courseIdPathParamSchema,
    createSection: createSectionSchema,
    createLecture: createLectureSchema,
    sectionIdParam: sectionIdParamSchema,
};
