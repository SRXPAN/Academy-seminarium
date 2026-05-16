import { prisma } from '../db.js'
import { AppError } from '../utils/AppError.js'
import type { CreateCourseInput, CreateLectureInput, CreateSectionInput, UpdateCourseInput } from '@elearn/shared'

type CourseActor = {
  id: string
  role: string
}

async function assertCanManageCourse(courseId: string, actor: CourseActor) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      instructorId: true,
    },
  })

  if (!course) {
    throw AppError.notFound('Course not found')
  }

  if (actor.role !== 'ADMIN' && course.instructorId !== actor.id) {
    throw AppError.forbidden('You can only manage your own course')
  }
}

async function assertCanManageSection(sectionId: string, actor: CourseActor) {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: {
      id: true,
      course: {
        select: {
          id: true,
          instructorId: true,
        },
      },
    },
  })

  if (!section) {
    throw AppError.notFound('Section not found')
  }

  if (actor.role !== 'ADMIN' && section.course.instructorId !== actor.id) {
    throw AppError.forbidden('You can only manage your own course')
  }
}

export async function createCourse(actor: CourseActor, input: CreateCourseInput) {
  return prisma.course.create({
    data: {
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      price: input.price,
      categoryId: input.categoryId,
      language: input.language,
      status: 'DRAFT',
      instructorId: actor.id,
    },
  })
}

export async function getCourseById(courseId: string, actor?: CourseActor | null) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      objectives: {
        select: {
          id: true,
          text: true,
        },
      },
      sections: {
        orderBy: {
          orderIndex: 'asc',
        },
        include: {
          lectures: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      },
    },
  })

  if (!course) {
    throw AppError.notFound('Course not found')
  }

  const canViewDraft = actor?.role === 'ADMIN' || actor?.id === course.instructorId
  if (course.status !== 'PUBLISHED' && !canViewDraft) {
    throw AppError.forbidden('Course is not published')
  }

  let isEnrolled = false
  if (actor) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: actor.id,
          courseId: course.id,
        },
      },
    })
    isEnrolled = !!enrollment
  }

  return {
    ...course,
    isEnrolled,
  }
}

export async function getMyCourses(actor: CourseActor) {
  const where = actor.role === 'ADMIN'
    ? {}
    : { instructorId: actor.id }

  return prisma.course.findMany({
    where,
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          sections: true,
        },
      },
    },
  })
}

type CourseListQuery = {
  search?: string
  categoryId?: string
}

export async function getPublishedCourses(query: CourseListQuery = {}) {
  const search = query.search?.trim()

  return prisma.course.findMany({
    where: {
      status: 'PUBLISHED',
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { subtitle: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          sections: true,
        },
      },
    },
  })
}

export async function updateCourse(actor: CourseActor, courseId: string, input: UpdateCourseInput) {
  await assertCanManageCourse(courseId, actor)

  return prisma.course.update({
    where: { id: courseId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.language !== undefined ? { language: input.language } : {}),
    },
  })
}

export async function createSection(actor: CourseActor, courseId: string, input: CreateSectionInput) {
  await assertCanManageCourse(courseId, actor)

  return prisma.section.create({
    data: {
      title: input.title,
      orderIndex: input.orderIndex,
      courseId,
    },
  })
}

export async function createLecture(actor: CourseActor, sectionId: string, input: CreateLectureInput) {
  await assertCanManageSection(sectionId, actor)

  return prisma.lecture.create({
    data: {
      title: input.title,
      type: input.type,
      orderIndex: input.orderIndex,
      ...(input.videoUrl !== undefined ? { videoUrl: input.videoUrl } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.duration !== undefined ? { duration: input.duration } : {}),
      ...(input.isPreview !== undefined ? { isPreview: input.isPreview } : {}),
      sectionId,
    },
  })
}

export async function getEnrolledCourses(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId },
    include: {
      course: {
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              sections: true,
            },
          },
        },
      },
    },
    orderBy: {
      enrolledAt: 'desc',
    },
  })

  return enrollments.map(e => e.course)
}
