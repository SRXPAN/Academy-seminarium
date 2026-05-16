import { z } from 'zod';
export declare const createCheckoutSessionRequest: z.ZodObject<{
    courseId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    courseId: string;
}, {
    courseId: string;
}>;
export declare const confirmPaymentRequest: z.ZodObject<{
    sessionId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
export type CreateCheckoutSessionRequest = z.infer<typeof createCheckoutSessionRequest>;
export type ConfirmPaymentRequest = z.infer<typeof confirmPaymentRequest>;
export declare const paymentSchemas: {
    createCheckoutSessionRequest: z.ZodObject<{
        courseId: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        courseId: string;
    }, {
        courseId: string;
    }>;
    confirmPaymentRequest: z.ZodObject<{
        sessionId: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        sessionId: string;
    }, {
        sessionId: string;
    }>;
};
//# sourceMappingURL=payments.d.ts.map