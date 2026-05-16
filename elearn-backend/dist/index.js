// src/index.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Load .env from monorepo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger.js';
import { prisma } from './db.js';
// Import Routes
import curriculumRouter from './routes/curriculum.routes.js';
import coursesRouter from './routes/courses.routes.js';
import paymentsRouter from './routes/payments.routes.js';
import i18nRouter from './routes/i18n.js';
import progressRouter from './routes/progress.routes.js';
import reviewsRouter from './routes/reviews.routes.js';
// Import Handlers
import { stripeWebhookHandler } from './controllers/payments.controller.js';
import { asyncHandler } from './middleware/errorHandler.js';
// Import Middleware
import { generalLimiter } from './middleware/rateLimit.js';
import { validateCsrf } from './middleware/csrf.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
const app = express();
app.set('trust proxy', 1);
// --- Security headers ---
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
    contentSecurityPolicy: false, // CSP handles on frontend
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
}));
const allowed = Array.from(new Set([
    ...(process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) ?? []),
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174'
].filter(Boolean)));
// Log allowed origins for debugging
logger.info(`CORS allowed origins: ${allowed.join(', ')}`);
app.use(cors({
    origin: (origin, cb) => {
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        if (!origin)
            return cb(null, true);
        if (allowed.includes(origin)) {
            return cb(null, true);
        }
        logger.warn(`CORS: Blocked request from origin: ${origin}`);
        return cb(new Error(`CORS not allowed for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400, // 24 hours - cache preflight requests
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
// --- Logging ---
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
// --- Stripe Webhook (MUST be before express.json()) ---
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), asyncHandler(stripeWebhookHandler));
// --- Body Parser ---
app.use(express.json({ limit: '1mb' }));
// --- Explicit OPTIONS handler for all routes ---
// This ensures CORS preflight requests are handled correctly
// Especially important when using Cloudflare or other proxies
app.options('*', cors());
// --- CSRF Protection (Mutating methods only) ---
// Stateless CSRF validation - works across multiple instances
app.use('/api', (req, res, next) => {
    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    // Skip CSRF for safe methods
    if (!mutatingMethods.includes(req.method)) {
        return next();
    }
    return validateCsrf(req, res, next);
});
// --- Global Rate Limit ---
app.use('/api', generalLimiter);
// --- Healthcheck ---
app.get('/api/health', (_req, res) => res.json({ ok: true }));
// --- Routes ---
app.use('/api', curriculumRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/i18n', i18nRouter);
app.use('/api/progress', progressRouter);
app.use('/api/reviews', reviewsRouter);
// --- Error Handling (MUST be last) ---
app.use(notFoundHandler); // 404 Handler
app.use(errorHandler); // Global Error Handler
// --- Server Startup ---
const port = Number(process.env.PORT ?? 4000);
const server = app.listen(port, () => logger.info(`API listening on http://localhost:${port}`));
// --- Graceful Shutdown ---
async function gracefulShutdown(signal) {
    logger.warn(`${signal} received. Starting graceful shutdown...`);
    server.close(async (err) => {
        if (err) {
            logger.error('Error during server close', err);
            process.exit(1);
        }
        logger.info('HTTP server closed');
        try {
            // Use top-level imported prisma instance for stable shutdown
            if (prisma && '$disconnect' in prisma) {
                await prisma.$disconnect();
                logger.info('Database connection closed');
            }
        }
        catch (dbErr) {
            logger.error('Error closing database', dbErr);
        }
        logger.info('Graceful shutdown completed');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', err);
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', new Error(String(reason)), { promise });
});
