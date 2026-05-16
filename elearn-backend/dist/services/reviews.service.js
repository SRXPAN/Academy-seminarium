import { prisma } from '../db.js';
import { AppError } from '../utils/AppError.js';
export async function createOrUpdateReview(userId, input) {
    const { courseId, rating, comment } = input;
    if (rating < 1 || rating > 5) {
        throw AppError.badRequest('Rating must be between 1 and 5');
    }
    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_courseId: {
                studentId: userId,
                courseId: courseId
            }
        }
    });
    if (!enrollment) {
        throw AppError.forbidden('You must be enrolled in the course to leave a review');
    }
    return prisma.review.upsert({
        where: {
            studentId_courseId: {
                studentId: userId,
                courseId: courseId
            }
        },
        update: {
            rating,
            comment
        },
        create: {
            studentId: userId,
            courseId: courseId,
            rating,
            comment
        }
    });
}
