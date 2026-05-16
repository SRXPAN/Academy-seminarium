import { prisma } from '../db.js'
import { AppError } from '../utils/AppError.js'

export async function updateLectureProgress(userId: string, lectureId: string, watchedSec: number, isCompleted: boolean) {
  // Check if lecture exists
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    select: { id: true, section: { select: { courseId: true } } }
  })

  if (!lecture) {
    throw AppError.notFound('Lecture not found')
  }

  // Check if user is enrolled in the course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: userId,
        courseId: lecture.section.courseId
      }
    }
  })

  if (!enrollment) {
    throw AppError.forbidden('You are not enrolled in this course')
  }

  return prisma.lectureProgress.upsert({
    where: {
      studentId_lectureId: {
        studentId: userId,
        lectureId: lectureId
      }
    },
    update: {
      watchedSec,
      isCompleted
    },
    create: {
      studentId: userId,
      lectureId,
      watchedSec,
      isCompleted
    }
  })
}

export async function getCourseProgress(userId: string, courseId: string) {
  const progress = await prisma.lectureProgress.findMany({
    where: {
      studentId: userId,
      lecture: {
        section: {
          courseId: courseId
        }
      }
    }
  })

  return progress
}
