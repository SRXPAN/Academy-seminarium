import { apiGet, apiPost } from '@/lib/http'
import type { Lang, LocalizedString, User } from '@packages/shared'

export type Category = 'Programming' | 'Mathematics' | 'Databases' | 'Networks' | 'WebDevelopment' | 'MobileDevelopment' | 'MachineLearning' | 'Security' | 'DevOps' | 'OperatingSystems' | string

export type CourseStatus = 'DRAFT' | 'PUBLISHED'
export type InstructorCourseStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED'
export type LectureType = 'VIDEO' | 'ARTICLE'

export interface CourseCategory {
  id: Category
  name: string
  nameJson?: LocalizedString
}

export interface CourseInstructorSummary {
  id: string
  name: string
  email?: string
  avatar?: string | null
}

export interface CourseLecture {
  id: string
  title: string
  type: LectureType
  orderIndex: number
  sectionId: string
  isPreview?: boolean
}

export interface CourseSection {
  id: string
  title: string
  orderIndex: number
  courseId: string
  lectures: CourseLecture[]
}

export interface CourseSummary {
  id: string
  title: string
  subtitle?: string | null
  description: string
  coverImage?: string | null
  price: number
  categoryId: Category
  language: Lang
  status: InstructorCourseStatus
  instructor: CourseInstructorSummary | User
  sections?: CourseSection[]
  _count?: {
    sections: number
  }
}

export interface CourseDetail extends CourseSummary {
  sections: CourseSection[]
  objectives?: string[]
  isEnrolled: boolean
}

export interface PublishedCoursesParams {
  search?: string
  categoryId?: Category | string | null
}

const fallbackCategories: CourseCategory[] = [
  { id: 'Programming', name: 'Programming' },
  { id: 'Mathematics', name: 'Mathematics' },
  { id: 'Databases', name: 'Databases' },
  { id: 'Networks', name: 'Networks' },
  { id: 'WebDevelopment', name: 'Web Development' },
  { id: 'MobileDevelopment', name: 'Mobile Development' },
  { id: 'MachineLearning', name: 'Machine Learning' },
  { id: 'Security', name: 'Security' },
  { id: 'DevOps', name: 'DevOps' },
  { id: 'OperatingSystems', name: 'Operating Systems' },
]

function buildQuery(params: PublishedCoursesParams = {}): string {
  const query = new URLSearchParams()

  query.set('status', 'PUBLISHED')

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  if (params.categoryId) {
    query.set('categoryId', params.categoryId)
  }

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export async function fetchPublishedCourses(params: PublishedCoursesParams = {}) {
  return apiGet<CourseSummary[]>(`/courses${buildQuery(params)}`)
}

export async function fetchMyCourses() {
  return apiGet<CourseSummary[]>(`/courses/mine`)
}

export async function fetchEnrolledCourses() {
  return apiGet<CourseSummary[]>(`/courses/enrolled`)
}

export async function fetchCourseById(courseId: string) {
  return apiGet<CourseDetail>(`/courses/${courseId}`)
}

export async function createCheckoutSession(courseId: string) {
  return apiPost<{ url: string; sessionId: string }>('/payments/create-checkout-session', { courseId })
}

export async function fetchCategories() {
  try {
    return await apiGet<CourseCategory[]>('/categories')
  } catch {
    return fallbackCategories
  }
}

export { fallbackCategories as courseFallbackCategories }
