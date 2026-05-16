import { create } from 'zustand'
import { fetchMyCourses, type CourseSummary } from '@/services/courses.service'

type InstructorState = {
  courses: CourseSummary[]
  loading: boolean
  error?: string
  loadCourses: () => Promise<void>
  addCourseToList: (course: CourseSummary) => void
}

const useInstructorStore = create<InstructorState>((set, get) => ({
  courses: [],
  loading: false,
  error: undefined,

  async loadCourses() {
    if (get().loading) return

    set({ loading: true, error: undefined })

    try {
      const courses = await fetchMyCourses()
      set({ courses, loading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load instructor courses'
      set({ loading: false, error: message })
    }
  },

  addCourseToList(course) {
    set((state) => ({ courses: [course, ...state.courses] }))
  },
}))

export default useInstructorStore