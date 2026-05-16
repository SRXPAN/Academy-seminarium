import Stripe from 'stripe'
import { prisma } from '../db.js'
import { AppError } from '../utils/AppError.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16',
})

interface CheckoutSessionInput {
  courseId: string
  userId: string
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(input: CheckoutSessionInput) {
  // Fetch course to get price and title
  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: {
      id: true,
      title: true,
      price: true,
      subtitle: true,
    },
  })

  if (!course) {
    throw AppError.notFound('Course not found')
  }

  // Validate course is published
  const publishedCourse = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: { status: true },
  })

  if (publishedCourse?.status !== 'PUBLISHED') {
    throw AppError.forbidden('Course is not available for purchase')
  }

  // Check if user already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: input.userId,
        courseId: input.courseId,
      },
    },
  })

  if (existingEnrollment) {
    throw AppError.conflict('User is already enrolled in this course')
  }

  // Convert price to cents (Stripe uses cents)
  const amountInCents = Math.round(course.price * 100)

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: course.subtitle || undefined,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: {
      userId: input.userId,
      courseId: input.courseId,
    },
  })

  // Create Transaction record with PENDING status
  const transaction = await prisma.transaction.create({
    data: {
      amount: course.price,
      stripeSessionId: session.id,
      status: 'PENDING',
      studentId: input.userId,
      courseId: input.courseId,
    },
  })

  return {
    sessionUrl: session.url,
    sessionId: session.id,
    transactionId: transaction.id,
  }
}

export async function handleCheckoutSuccess(sessionId: string) {
  // Fetch Stripe session to verify payment was successful
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    throw AppError.badRequest('Payment not completed')
  }

  const metadata = session.metadata as {
    userId?: string
    courseId?: string
  }

  if (!metadata.userId || !metadata.courseId) {
    throw AppError.badRequest('Invalid session metadata')
  }

  // Update transaction status to SUCCESS
  const transaction = await prisma.transaction.update({
    where: { stripeSessionId: sessionId },
    data: { status: 'SUCCESS' },
  })

  // Create enrollment
  const enrollment = await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: metadata.userId,
        courseId: metadata.courseId,
      },
    },
    update: {},
    create: {
      studentId: metadata.userId,
      courseId: metadata.courseId,
    },
  })

  return {
    transaction,
    enrollment,
  }
}

export async function verifyWebhookEvent(payload: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    return event
  } catch (err: any) {
    throw AppError.badRequest(`Webhook signature verification failed: ${err.message}`)
  }
}

export async function handleWebhookCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata as {
    userId?: string
    courseId?: string
  }

  if (!metadata.userId || !metadata.courseId) {
    throw new Error('Missing metadata in Stripe session')
  }

  const stripeSessionId = session.id

  // Update transaction status to SUCCESS
  await prisma.transaction.update({
    where: { stripeSessionId },
    data: { status: 'SUCCESS' },
  })

  // Create enrollment
  const enrollment = await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: metadata.userId,
        courseId: metadata.courseId,
      },
    },
    update: {},
    create: {
      studentId: metadata.userId,
      courseId: metadata.courseId,
    },
  })

  return enrollment
}
