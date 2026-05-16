import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateResource } from '../middleware/validateResource.js';
import { createCheckoutSessionRequest, confirmPaymentRequest } from '@elearn/shared';
import { createCheckoutSessionHandler, handleCheckoutSuccessHandler } from '../controllers/payments.controller.js';
const router = Router();
// POST /api/payments/create-checkout-session
// Create a Stripe checkout session for course purchase
router.post('/create-checkout-session', requireAuth, requireRole(['STUDENT']), validateResource(createCheckoutSessionRequest, 'body'), asyncHandler(createCheckoutSessionHandler));
// POST /api/payments/confirm-success
// Confirm successful payment and create enrollment
router.post('/confirm-success', requireAuth, requireRole(['STUDENT']), validateResource(confirmPaymentRequest, 'body'), asyncHandler(handleCheckoutSuccessHandler));
export default router;
