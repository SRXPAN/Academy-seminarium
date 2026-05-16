import { z } from 'zod';
export declare const courseLanguageSchema: z.ZodEnum<["UA", "PL", "EN"]>;
export declare const createCourse: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    price: z.ZodNumber;
    categoryId: z.ZodString;
    language: z.ZodEnum<["UA", "PL", "EN"]>;
}, "strict", z.ZodTypeAny, {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    language: "UA" | "PL" | "EN";
    subtitle?: string | undefined;
}, {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    language: "UA" | "PL" | "EN";
    subtitle?: string | undefined;
}>;
export declare const updateCourse: z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    subtitle: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    categoryId: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodEnum<["UA", "PL", "EN"]>>;
}, "strict", z.ZodTypeAny, {
    title?: string | undefined;
    subtitle?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    categoryId?: string | undefined;
    language?: "UA" | "PL" | "EN" | undefined;
}, {
    title?: string | undefined;
    subtitle?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    categoryId?: string | undefined;
    language?: "UA" | "PL" | "EN" | undefined;
}>, {
    title?: string | undefined;
    subtitle?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    categoryId?: string | undefined;
    language?: "UA" | "PL" | "EN" | undefined;
}, {
    title?: string | undefined;
    subtitle?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    categoryId?: string | undefined;
    language?: "UA" | "PL" | "EN" | undefined;
}>;
export declare const courseIdParam: z.ZodObject<{
    id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const courseIdPathParam: z.ZodObject<{
    courseId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    courseId: string;
}, {
    courseId: string;
}>;
export type CreateCourseInput = z.infer<typeof createCourse>;
export type UpdateCourseInput = z.infer<typeof updateCourse>;
export type CourseIdParamInput = z.infer<typeof courseIdParam>;
export type CourseIdPathParamInput = z.infer<typeof courseIdPathParam>;
export declare const courseSchemas: {
    createCourse: z.ZodObject<{
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        price: z.ZodNumber;
        categoryId: z.ZodString;
        language: z.ZodEnum<["UA", "PL", "EN"]>;
    }, "strict", z.ZodTypeAny, {
        title: string;
        description: string;
        price: number;
        categoryId: string;
        language: "UA" | "PL" | "EN";
        subtitle?: string | undefined;
    }, {
        title: string;
        description: string;
        price: number;
        categoryId: string;
        language: "UA" | "PL" | "EN";
        subtitle?: string | undefined;
    }>;
    updateCourse: z.ZodEffects<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        subtitle: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        description: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodNumber>;
        categoryId: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodEnum<["UA", "PL", "EN"]>>;
    }, "strict", z.ZodTypeAny, {
        title?: string | undefined;
        subtitle?: string | undefined;
        description?: string | undefined;
        price?: number | undefined;
        categoryId?: string | undefined;
        language?: "UA" | "PL" | "EN" | undefined;
    }, {
        title?: string | undefined;
        subtitle?: string | undefined;
        description?: string | undefined;
        price?: number | undefined;
        categoryId?: string | undefined;
        language?: "UA" | "PL" | "EN" | undefined;
    }>, {
        title?: string | undefined;
        subtitle?: string | undefined;
        description?: string | undefined;
        price?: number | undefined;
        categoryId?: string | undefined;
        language?: "UA" | "PL" | "EN" | undefined;
    }, {
        title?: string | undefined;
        subtitle?: string | undefined;
        description?: string | undefined;
        price?: number | undefined;
        categoryId?: string | undefined;
        language?: "UA" | "PL" | "EN" | undefined;
    }>;
    courseIdParam: z.ZodObject<{
        id: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    courseIdPathParam: z.ZodObject<{
        courseId: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        courseId: string;
    }, {
        courseId: string;
    }>;
};
//# sourceMappingURL=course.d.ts.map