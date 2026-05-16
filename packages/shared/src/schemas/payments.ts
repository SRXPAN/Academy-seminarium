import { z } from 'zod'

export const createCheckoutSessionRequest = z.object({
  courseId: z.string().cuid('Invalid course ID'),
}).strict()

export const confirmPaymentRequest = z.object({
  sessionId: z.string(),
}).strict()

export type CreateCheckoutSessionRequest = z.infer<typeof createCheckoutSessionRequest>
export type ConfirmPaymentRequest = z.infer<typeof confirmPaymentRequest>

export const paymentSchemas = {
  createCheckoutSessionRequest,
  confirmPaymentRequest,
}
