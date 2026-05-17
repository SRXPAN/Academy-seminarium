import { create } from 'zustand'
import { fetchCategories, fetchCourseById, fetchPublishedCourses, type CourseCategory, type CourseDetail, type CourseSummary } from '@/services/courses.service'

type CatalogState = {
  // Marketplace state
  courses: CourseSummary[]
  courseDetails: Record<string, CourseDetail>
  categories: CourseCategory[]
  searchQuery: string
  selectedCategoryId: string | null
  marketplaceLoading: boolean
  marketplaceError?: string
  
  setSearchQuery: (searchQuery: string) => void
  setSelectedCategoryId: (categoryId: string | null) => void
  resetMarketplaceFilters: () => void
  loadPublishedCourses: () => Promise<void>
  loadCourseDetails: (courseId: string) => Promise<CourseDetail>
  loadCategories: () => Promise<void>
}

const useCatalogStore = create<CatalogState>((set, get) => ({
  courses: [],
  courseDetails: {},
  categories: [],
  searchQuery: '',
  selectedCategoryId: null,
  marketplaceLoading: false,
  marketplaceError: undefined,
  
  setSearchQuery(searchQuery) {
    set({ searchQuery })
  },

  setSelectedCategoryId(categoryId) {
    set({ selectedCategoryId: categoryId })
  },

  resetMarketplaceFilters() {
    set({ searchQuery: '', selectedCategoryId: null })
  },

  async loadPublishedCourses() {
    const state = get()

    if (state.marketplaceLoading) return

    set({ marketplaceLoading: true, marketplaceError: undefined })

    try {
      const courses = await fetchPublishedCourses({
        search: state.searchQuery || undefined,
        categoryId: state.selectedCategoryId || undefined,
      })

      set({ courses, marketplaceLoading: false })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load courses'
      set({ marketplaceLoading: false, marketplaceError: message })
      console.error('[catalog] Error loading courses:', e)
    }
  },

  async loadCourseDetails(courseId) {
    const cached = get().courseDetails[courseId]
    if (cached) return cached

    set({ marketplaceLoading: true, marketplaceError: undefined })

    try {
      const course = await fetchCourseById(courseId)
      set((state) => ({
        courseDetails: { ...state.courseDetails, [courseId]: course },
        marketplaceLoading: false,
      }))
      return course
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load course'
      set({ marketplaceLoading: false, marketplaceError: message })
      throw e
    }
  },

  async loadCategories() {
    const state = get()
    if (state.categories.length > 0) return

    set({ marketplaceLoading: true, marketplaceError: undefined })

    try {
      const categories = await fetchCategories()
      set({ categories, marketplaceLoading: false })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load categories'
      set({ marketplaceLoading: false, marketplaceError: message })
      console.error('[catalog] Error loading categories:', e)
    }
  },
}))

export default useCatalogStore
