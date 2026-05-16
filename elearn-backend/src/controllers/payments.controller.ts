import type { Request, Response } from 'express'
import { AppError } from '../utils/AppError.js'
import { ok } from '../utils/response.js'
import { 
  createCheckoutSession, 
  handleCheckoutSuccess, 
  verifyWebhookEvent, 
  handleWebhookCheckoutCompleted 
} from '../services/payments.service.js'
import { logger } from '../utils/logger.js'
import type Stripe from 'stripe'

export async function createCheckoutSessionHandler(req: Request, res: Response) {
  const user = req.user

  if (!user) {
    throw AppError.unauthorized('Unauthorized')
  }

  // Get the frontend base URL from environment or infer from request
  const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`

  const { courseId } = req.body as { courseId?: string }

  if (!courseId) {
    throw AppError.badRequest('courseId is required')
  }

  // Build success and cancel URLs
  const successUrl = `${frontendUrl}/courses/${courseId}?success=true&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${frontendUrl}/courses/${courseId}?canceled=true`

  const result = await createCheckoutSession({
    courseId,
    userId: user.id,
    successUrl,
    cancelUrl,
  })

  return ok(res, {
    url: result.sessionUrl,
    sessionId: result.sessionId,
  })
}

export async function handleCheckoutSuccessHandler(req: Request, res: Response) {
  const { sessionId } = req.body as { sessionId?: string }

  if (!sessionId) {
    throw AppError.badRequest('sessionId is required')
  }

  const result = await handleCheckoutSuccess(sessionId)

  return ok(res, {
    message: 'Enrollment successful',
    enrollment: result.enrollment,
  })
}

export async function stripeWebhookHandler(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string

  if (!signature) {
    throw AppError.badRequest('Missing stripe-signature header')
  }

  let event: Stripe.Event

  try {
    // req.body should be the raw buffer because of express.raw middleware
    event = await verifyWebhookEvent(req.body, signature)
  } catch (err: any) {
    logger.error(`[Stripe Webhook] Error: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  logger.info(`[Stripe Webhook] Event received: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleWebhookCheckoutCompleted(session)
        break
      }
      default:
        logger.info(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return ok(res, { received: true })
  } catch (err: any) {
    logger.error(`[Stripe Webhook] Processing Error: ${err.message}`)
    return res.status(500).send(`Webhook Processing Error: ${err.message}`)
  }
}
