import { z } from 'zod';
export const lectureTypeSchema = z.enum(['VIDEO', 'ARTICLE']);
export const createLecture = z.object({
    title: z.string().trim().min(1).max(255),
    type: lectureTypeSchema,
    orderIndex: z.coerce.number().int().min(0),
    videoUrl: z.string().trim().url().max(2000).optional(),
    content: z.string().trim().min(1).max(50000).optional(),
    duration: z.coerce.number().int().min(0).optional(),
    isPreview: z.coerce.boolean().optional(),
}).strict().superRefine((data, ctx) => {
    if (data.type === 'VIDEO' && !data.videoUrl) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['videoUrl'],
            message: 'Video lectures require a video URL',
        });
    }
    if (data.type === 'ARTICLE' && !data.content) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['content'],
            message: 'Article lectures require content',
        });
    }
});
export const lectureSchemas = {
    createLecture,
};
