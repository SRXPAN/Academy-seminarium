import { create } from 'zustand'
import { api } from '@/lib/http'
import { fetchCategories, fetchCourseById, fetchPublishedCourses, type CourseCategory, type CourseDetail, type CourseSummary } from '@/services/courses.service'
import type { TopicTree, Quiz, Lang } from '@packages/shared'

// Re-export TopicTree for components that import from here
export type { TopicTree }

type CatalogState = {
  topics: TopicTree[]
  loading: boolean // renamed from topicsLoading for standard naming
  error?: string   // renamed from topicsError
  lang?: Lang      // Track which lang was used to load
  
  // Квізи кешуємо окремо
  quizMap: Record<string, Quiz>
  quizLoading: Record<string, boolean>
  quizError: Record<string, string | undefined>

  // Marketplace state
  courses: CourseSummary[]
  courseDetails: Record<string, CourseDetail>
  categories: CourseCategory[]
  searchQuery: string
  selectedCategoryId: string | null
  marketplaceLoading: boolean
  marketplaceError?: string
  
  loadTopics: (lang?: Lang) => Promise<void>
  loadQuiz: (id: string, lang?: Lang) => Promise<Quiz>
  invalidateTopics: () => void
  invalidateQuiz: (id: string) => void
  invalidateAll: () => void
  markMaterialAsSeen: (materialId: string) => void

  setSearchQuery: (searchQuery: string) => void
  setSelectedCategoryId: (categoryId: string | null) => void
  resetMarketplaceFilters: () => void
  loadPublishedCourses: () => Promise<void>
  loadCourseDetails: (courseId: string) => Promise<CourseDetail>
  loadCategories: () => Promise<void>
}

const useCatalogStore = create<CatalogState>((set, get) => ({
  topics: [],
  loading: false,
  error: undefined,
  lang: undefined,
  quizMap: {},
  quizLoading: {},
  quizError: {},
  courses: [],
  courseDetails: {},
  categories: [],
  searchQuery: '',
  selectedCategoryId: null,
  marketplaceLoading: false,
  marketplaceError: undefined,
  
  async loadTopics(lang) {
    const state = get()
    // Якщо вже вантажиться або дані є для цієї мови — не чіпаємо
    if (state.loading) return
    if (state.topics.length > 0 && state.lang === lang) return
    
    set({ loading: true, error: undefined })
    
    try {
      // Використовуємо новий API клієнт
      const query = lang ? `?lang=${lang}` : ''
      const data = await api<TopicTree[]>(`/topics/tree${query}`)
      
      // Логування для дебагу
      if (import.meta.env.DEV) {
        console.debug('[catalog] Received topics data:', { type: typeof data, isArray: Array.isArray(data), data })
      }
      
      // Defensive: ensure data is array and all topics have materials and quizzes arrays
      const topics = Array.isArray(data) ? data.map(topic => ({
        ...topic,
        materials: Array.isArray(topic.materials) ? topic.materials : [],
        quizzes: Array.isArray(topic.quizzes) ? topic.quizzes : [],
        children: topic.children?.map(child => ({
          ...child,
          materials: Array.isArray(child.materials) ? child.materials : [],
          quizzes: Array.isArray(child.quizzes) ? child.quizzes : []
        })) || []
      })) : []
      set({ topics, loading: false, lang })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load topics'
      set({ loading: false, error: message })
      // Не кидаємо помилку далі, щоб UI просто показав стан помилки, а не крашнувся
      console.error('[catalog] Error loading topics:', e)
    }
  },
  
  async loadQuiz(id, lang) {
    const cacheKey = lang ? `${id}_${lang}` : id
    const state = get()
    
    // Повертаємо з кешу, якщо є
    const cached = state.quizMap[cacheKey]
    if (cached) return cached
    
    // Якщо вже вантажиться цей квіз - ігноруємо
    if (state.quizLoading[id]) throw new Promise(() => {}) // Hacky way to suspend/wait, but usually better to just return undefined
    
    set((s) => ({ 
      quizLoading: { ...s.quizLoading, [id]: true }, 
      quizError: { ...s.quizError, [id]: undefined } 
    }))
    
    try {
      const query = lang ? `?lang=${lang}` : ''
      const q = await api<Quiz>(`/quiz/${id}${query}`)
      
      set((s) => ({ 
        quizMap: { ...s.quizMap, [cacheKey]: q }, 
        quizLoading: { ...s.quizLoading, [id]: false } 
      }))
      return q
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load quiz'
      set((s) => ({ 
        quizLoading: { ...s.quizLoading, [id]: false }, 
        quizError: { ...s.quizError, [id]: message } 
      }))
      throw e
    }
  },

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
  
  invalidateTopics() {
    set({ topics: [], error: undefined, lang: undefined })
  },
  
  invalidateQuiz(id) {
    set((s) => {
      const newMap = { ...s.quizMap }
      // Видаляємо всі варіанти квіза (різні мови)
      Object.keys(newMap).forEach(key => {
        if (key === id || key.startsWith(`${id}_`)) {
          delete newMap[key]
        }
      })
      return { quizMap: newMap }
    })
  },
  
  invalidateAll() {
    set({ 
      topics: [], 
      loading: false, 
      error: undefined, 
      lang: undefined, 
      quizMap: {}, 
      quizError: {} 
    })
  },
  
  // Optimistically mark material as seen without reloading
  markMaterialAsSeen(materialId: string) {
    set((state) => {
      const updateMaterial = (topics: TopicTree[]): TopicTree[] => {
        return topics.map(topic => ({
          ...topic,
          materials: topic.materials?.map(m => 
            m.id === materialId ? { ...m, isSeen: true } : m
          ),
          children: topic.children ? updateMaterial(topic.children) : undefined
        }))
      }
      return { topics: updateMaterial(state.topics) }
    })
  },
}))

export default useCatalogStore
