import { z } from 'zod';
export declare const lectureTypeSchema: z.ZodEnum<["VIDEO", "ARTICLE"]>;
export declare const createLecture: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    type: z.ZodEnum<["VIDEO", "ARTICLE"]>;
    orderIndex: z.ZodNumber;
    videoUrl: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    isPreview: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    title: string;
    type: "VIDEO" | "ARTICLE";
    orderIndex: number;
    videoUrl?: string | undefined;
    content?: string | undefined;
    duration?: number | undefined;
    isPreview?: boolean | undefined;
}, {
    title: string;
    type: "VIDEO" | "ARTICLE";
    orderIndex: number;
    videoUrl?: string | undefined;
    content?: string | undefined;
    duration?: number | undefined;
    isPreview?: boolean | undefined;
}>, {
    title: string;
    type: "VIDEO" | "ARTICLE";
    orderIndex: number;
    videoUrl?: string | undefined;
    content?: string | undefined;
    duration?: number | undefined;
    isPreview?: boolean | undefined;
}, {
    title: string;
    type: "VIDEO" | "ARTICLE";
    orderIndex: number;
    videoUrl?: string | undefined;
    content?: string | undefined;
    duration?: number | undefined;
    isPreview?: boolean | undefined;
}>;
export type CreateLectureInput = z.infer<typeof createLecture>;
export declare const lectureSchemas: {
    createLecture: z.ZodEffects<z.ZodObject<{
        title: z.ZodString;
        type: z.ZodEnum<["VIDEO", "ARTICLE"]>;
        orderIndex: z.ZodNumber;
        videoUrl: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodNumber>;
        isPreview: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        title: string;
        type: "VIDEO" | "ARTICLE";
        orderIndex: number;
        videoUrl?: string | undefined;
        content?: string | undefined;
        duration?: number | undefined;
        isPreview?: boolean | undefined;
    }, {
        title: string;
        type: "VIDEO" | "ARTICLE";
        orderIndex: number;
        videoUrl?: string | undefined;
        content?: string | undefined;
        duration?: number | undefined;
        isPreview?: boolean | undefined;
    }>, {
        title: string;
        type: "VIDEO" | "ARTICLE";
        orderIndex: number;
        videoUrl?: string | undefined;
        content?: string | undefined;
        duration?: number | undefined;
        isPreview?: boolean | undefined;
    }, {
        title: string;
        type: "VIDEO" | "ARTICLE";
        orderIndex: number;
        videoUrl?: string | undefined;
        content?: string | undefined;
        duration?: number | undefined;
        isPreview?: boolean | undefined;
    }>;
};
//# sourceMappingURL=lecture.d.ts.map