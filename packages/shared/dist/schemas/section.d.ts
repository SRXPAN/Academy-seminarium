import { z } from 'zod';
export declare const createSection: z.ZodObject<{
    title: z.ZodString;
    orderIndex: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    title: string;
    orderIndex: number;
}, {
    title: string;
    orderIndex: number;
}>;
export declare const sectionIdParam: z.ZodObject<{
    sectionId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    sectionId: string;
}, {
    sectionId: string;
}>;
export type CreateSectionInput = z.infer<typeof createSection>;
export type SectionIdParamInput = z.infer<typeof sectionIdParam>;
export declare const sectionSchemas: {
    createSection: z.ZodObject<{
        title: z.ZodString;
        orderIndex: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        title: string;
        orderIndex: number;
    }, {
        title: string;
        orderIndex: number;
    }>;
    sectionIdParam: z.ZodObject<{
        sectionId: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        sectionId: string;
    }, {
        sectionId: string;
    }>;
};
//# sourceMappingURL=section.d.ts.map