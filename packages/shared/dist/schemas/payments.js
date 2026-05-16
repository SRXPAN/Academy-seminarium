import { z } from 'zod';
export const createCheckoutSessionRequest = z.object({
    courseId: z.string().cuid('Invalid course ID'),
}).strict();
export const confirmPaymentRequest = z.object({
    sessionId: z.string(),
}).strict();
export const paymentSchemas = {
    createCheckoutSessionRequest,
    confirmPaymentRequest,
};
