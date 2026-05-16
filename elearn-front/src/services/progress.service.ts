import { apiGet, apiPut } from '@/lib/http'

export interface LectureProgress {
  id: string
  studentId: string
  lectureId: string
  isCompleted: boolean
  watchedSec: number
  updatedAt: string
}

export async function fetchCourseProgress(courseId: string) {
  return apiGet<LectureProgress[]>(`/progress/course/${courseId}`)
}

export async function updateLectureProgress(lectureId: string, watchedSec: number, isCompleted: boolean) {
  return apiPut<LectureProgress>(`/progress/${lectureId}`, { watchedSec, isCompleted })
}
