import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, Loader2, AlertCircle, ChevronDown, ChevronUp, Plus, BookOpen, ChevronRight, Video, FileText, CheckCircle2 } from 'lucide-react'
import { updateCourse as updateCourseSchema, type UpdateCourseInput } from '@packages/shared'
import { fetchCourseById, courseFallbackCategories, type CourseDetail, type CourseCategory } from '@/services/courses.service'
import { apiPost, apiPut } from '@/lib/http'

type CreateSectionFormState = {
  title: string
  orderIndex: string
}

type CreateLectureFormState = {
  title: string
  type: 'VIDEO' | 'ARTICLE'
  orderIndex: string
  videoUrl: string
  content: string
  duration: string
  isPreview: boolean
}

const defaultCreateSectionForm: CreateSectionFormState = {
  title: '',
  orderIndex: '0',
}

const defaultCreateLectureForm: CreateLectureFormState = {
  title: '',
  type: 'VIDEO',
  orderIndex: '0',
  videoUrl: '',
  content: '',
  duration: '',
  isPreview: false,
}

const DUMMY_VIDEO_URL = 'https://dummy-video-url.com/video.mp4'

function resolveCategoryOptions(currentCategoryId?: string | null): CourseCategory[] {
  const fallback = [...courseFallbackCategories]
  if (currentCategoryId && !fallback.some((category) => category.id === currentCategoryId)) {
    fallback.unshift({ id: currentCategoryId as CourseCategory['id'], name: currentCategoryId })
  }
  return fallback
}

export default function CourseEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [curriculumMessage, setCurriculumMessage] = useState<string | null>(null)
  const [curriculumError, setCurriculumError] = useState<string | null>(null)
  const [sectionForm, setSectionForm] = useState<CreateSectionFormState>(defaultCreateSectionForm)
  const [lectureForm, setLectureForm] = useState<CreateLectureFormState>(defaultCreateLectureForm)
  const [lectureFormSectionId, setLectureFormSectionId] = useState<string | null>(null)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [isVideoUploading, setIsVideoUploading] = useState(false)
  const [selectedVideoName, setSelectedVideoName] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateCourseInput>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      title: '',
      subtitle: undefined,
      description: '',
      price: 0,
      categoryId: undefined,
      language: undefined,
    },
  })

  useEffect(() => {
    let mounted = true

    async function loadCourse() {
      if (!id) return

      try {
        setLoading(true)
        setSubmitError(null)
        const data = await fetchCourseById(id)

        if (!mounted) return

        setCourse(data)
        reset({
          title: data.title,
          subtitle: data.subtitle ?? undefined,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId,
          language: data.language,
        })
      } catch (error) {
        if (!mounted) return
        const message = error instanceof Error ? error.message : 'Failed to load course'
        setSubmitError(message)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadCourse()

    return () => {
      mounted = false
    }
  }, [id, reset])

  useEffect(() => {
    if (!course?.sections?.length) return
    setSectionForm((current) => (
      current.title || current.orderIndex !== defaultCreateSectionForm.orderIndex
        ? current
        : { ...current, orderIndex: String(course.sections.length) }
    ))
  }, [course?.sections?.length])

  const reloadCourse = useCallback(async () => {
    if (!id) return

    const data = await fetchCourseById(id)
    setCourse(data)
  }, [id])

  const sections = useMemo(() => {
    return [...(course?.sections ?? [])].sort((left, right) => left.orderIndex - right.orderIndex)
  }, [course?.sections])

  const handleReorderSection = useCallback((sectionId: string, direction: -1 | 1) => {
    setCourse((current) => {
      if (!current) return current

      const sorted = [...current.sections].sort((left, right) => left.orderIndex - right.orderIndex)
      const index = sorted.findIndex((section) => section.id === sectionId)
      const targetIndex = index + direction

      if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) {
        return current
      }

      const next = [...sorted]
      const currentSection = next[index]
      const targetSection = next[targetIndex]
      next[index] = { ...targetSection, orderIndex: currentSection.orderIndex }
      next[targetIndex] = { ...currentSection, orderIndex: targetSection.orderIndex }

      return { ...current, sections: next }
    })
  }, [])

  const handleReorderLecture = useCallback((sectionId: string, lectureId: string, direction: -1 | 1) => {
    setCourse((current) => {
      if (!current) return current

      const nextSections = current.sections.map((section) => {
        if (section.id !== sectionId) return section

        const lectures = [...section.lectures].sort((left, right) => left.orderIndex - right.orderIndex)
        const index = lectures.findIndex((lecture) => lecture.id === lectureId)
        const targetIndex = index + direction

        if (index < 0 || targetIndex < 0 || targetIndex >= lectures.length) {
          return section
        }

        const reordered = [...lectures]
        const currentLecture = reordered[index]
        const targetLecture = reordered[targetIndex]
        reordered[index] = { ...targetLecture, orderIndex: currentLecture.orderIndex }
        reordered[targetIndex] = { ...currentLecture, orderIndex: targetLecture.orderIndex }

        return { ...section, lectures: reordered }
      })

      return { ...current, sections: nextSections }
    })
  }, [])

  const simulateVideoUpload = useCallback((file: File) => {
    setCurriculumError(null)
    setCurriculumMessage(null)
    setIsVideoUploading(true)
    setVideoUploadProgress(0)
    setSelectedVideoName(file.name)

    const advance = (progress: number) => {
      const nextProgress = Math.min(progress + 20, 100)
      setVideoUploadProgress(nextProgress)

      if (nextProgress >= 100) {
        setLectureForm((state) => ({ ...state, videoUrl: DUMMY_VIDEO_URL }))
        setCurriculumMessage('Mock upload completed. Video URL updated with a dummy value.')
        setTimeout(() => {
          setIsVideoUploading(false)
        }, 250)
        return
      }

      setTimeout(() => advance(nextProgress), 250)
    }

    setTimeout(() => advance(0), 250)
  }, [])

  async function handleCreateSection() {
    if (!id) return

    setCurriculumError(null)
    setCurriculumMessage(null)

    try {
      await apiPost(`/courses/${id}/sections`, {
        title: sectionForm.title,
        orderIndex: Number(sectionForm.orderIndex),
      })

      setSectionForm(defaultCreateSectionForm)
      await reloadCourse()
      setCurriculumMessage('Section created successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create section'
      setCurriculumError(message)
    }
  }

  async function handleCreateLecture(sectionId: string) {
    setCurriculumError(null)
    setCurriculumMessage(null)

    try {
      await apiPost(`/sections/${sectionId}/lectures`, {
        title: lectureForm.title,
        type: lectureForm.type,
        orderIndex: Number(lectureForm.orderIndex),
        videoUrl: lectureForm.type === 'VIDEO' ? lectureForm.videoUrl.trim() || undefined : undefined,
        content: lectureForm.type === 'ARTICLE' ? lectureForm.content.trim() || undefined : undefined,
        duration: lectureForm.duration ? Number(lectureForm.duration) : undefined,
        isPreview: lectureForm.isPreview,
      })

      setLectureForm(defaultCreateLectureForm)
      setLectureFormSectionId(null)
      await reloadCourse()
      setCurriculumMessage('Lecture created successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create lecture'
      setCurriculumError(message)
    }
  }

  const categoryOptions = useMemo(() => resolveCategoryOptions(course?.categoryId), [course?.categoryId])

  const onSubmit = async (values: UpdateCourseInput) => {
    if (!id) return

    setSubmitError(null)
    setSaveSuccess(null)

    try {
      const payload = {
        ...values,
        subtitle: values.subtitle?.trim() ? values.subtitle.trim() : undefined,
      }

      await apiPut(`/courses/${id}`, payload)
      setSaveSuccess('Course updated successfully.')
      navigate('/instructor/courses')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update course'
      setSubmitError(message)
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Loading course...</p>
      </div>
    )
  }

  if (submitError && !course) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm dark:border-red-900/40 dark:bg-red-900/10">
        <div className="flex items-start gap-3 text-red-700 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h1 className="text-lg font-semibold">Unable to load course</h1>
            <p className="mt-1 text-sm">{submitError}</p>
            <Link to="/instructor/courses" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
              <ArrowLeft size={16} />
              Back to courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <Link to="/instructor/courses" className="inline-flex items-center gap-2 hover:text-neutral-900 dark:hover:text-white">
              <ArrowLeft size={16} />
              Back to My Courses
            </Link>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-neutral-900 dark:text-white">Edit Course</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Update the basic information for {course?.title || 'this course'}.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Title</span>
            <input
              {...register('title')}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
              placeholder="Course title"
            />
            {errors.title && <p className="text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>}
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Subtitle</span>
            <input
              {...register('subtitle', {
                setValueAs: (value) => {
                  const normalized = typeof value === 'string' ? value.trim() : value
                  return normalized ? normalized : undefined
                },
              })}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
              placeholder="Short marketing subtitle"
            />
            {errors.subtitle && <p className="text-sm text-red-600 dark:text-red-400">{errors.subtitle.message}</p>}
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</span>
            <textarea
              {...register('description')}
              rows={5}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
              placeholder="Course description"
            />
            {errors.description && <p className="text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Price</span>
            <input
              type="number"
              min="0"
              step="1"
              {...register('price', { valueAsNumber: true })}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
              placeholder="49"
            />
            {errors.price && <p className="text-sm text-red-600 dark:text-red-400">{errors.price.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</span>
            <select
              {...register('categoryId')}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-sm text-red-600 dark:text-red-400">{errors.categoryId.message}</p>}
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Status changes and curriculum editing come later. This page covers basic course info only.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {submitError && course && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
            {submitError}
          </div>
        )}

        {saveSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-300">
            {saveSuccess}
          </div>
        )}
      </form>

      <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-600 dark:text-primary-400">Curriculum</p>
            <h2 className="mt-2 text-2xl font-display font-bold text-neutral-900 dark:text-white">Course structure</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Add sections, place lectures inside each section, and adjust order locally with the arrow controls.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-3 py-2 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <BookOpen size={16} />
            {sections.length} sections
          </div>
        </div>

        {curriculumMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-300">
            {curriculumMessage}
          </div>
        )}

        {curriculumError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
            {curriculumError}
          </div>
        )}

        <div className="grid gap-4 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40 md:grid-cols-[1fr_auto] md:items-end">
          <label className="space-y-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">New Section title</span>
            <input
              value={sectionForm.title}
              onChange={(event) => setSectionForm((state) => ({ ...state, title: event.target.value }))}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
              placeholder="Introduction to the course"
            />
          </label>

          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">orderIndex</span>
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950">
                <button
                  type="button"
                  onClick={() => setSectionForm((state) => ({ ...state, orderIndex: String(Math.max(0, Number(state.orderIndex) - 1)) }))}
                  className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <ChevronDown size={16} />
                </button>
                <input
                  type="number"
                  min="0"
                  value={sectionForm.orderIndex}
                  onChange={(event) => setSectionForm((state) => ({ ...state, orderIndex: event.target.value }))}
                  className="w-16 border-0 bg-transparent text-center text-sm font-medium text-neutral-900 outline-none dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setSectionForm((state) => ({ ...state, orderIndex: String(Number(state.orderIndex || '0') + 1) }))}
                  className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </label>

            <button
              type="button"
              onClick={handleCreateSection}
              disabled={!sectionForm.title.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-200 p-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              No sections yet. Create the first section to start building the curriculum.
            </div>
          ) : (
            sections.map((section, sectionIndex) => {
              const sectionLectureCount = section.lectures?.length ?? 0
              return (
                <details
                  key={section.id}
                  open={sectionIndex === 0}
                  className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
                        {section.orderIndex + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-lg font-semibold text-neutral-900 dark:text-white">{section.title}</h3>
                          <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                            order {section.orderIndex}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{sectionLectureCount} lectures</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          handleReorderSection(section.id, -1)
                        }}
                        className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                        title="Move section up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          handleReorderSection(section.id, 1)
                        }}
                        className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                        title="Move section down"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <ChevronRight size={18} className="text-neutral-400 transition-transform group-open:rotate-90" />
                    </div>
                  </summary>

                  <div className="space-y-4 border-t border-neutral-200 px-5 py-5 dark:border-neutral-800">
                    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            <Plus size={16} />
                            Add Lecture
                          </div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Create a lecture inside this section.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setLectureFormSectionId(section.id)
                            setLectureForm((state) => ({
                              ...state,
                              orderIndex: String(sectionLectureCount),
                            }))
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                        >
                          <Plus size={16} />
                          Add Lecture
                        </button>
                      </div>

                      {lectureFormSectionId === section.id && (
                        <div className="mt-4 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-2">
                          <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Lecture title</span>
                            <input
                              value={lectureForm.title}
                              onChange={(event) => setLectureForm((state) => ({ ...state, title: event.target.value }))}
                              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                              placeholder="Introduction"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Type</span>
                            <select
                              value={lectureForm.type}
                              onChange={(event) => {
                                const nextType = event.target.value as CreateLectureFormState['type']
                                setLectureForm((state) => ({
                                  ...state,
                                  type: nextType,
                                  videoUrl: nextType === 'VIDEO' ? state.videoUrl : '',
                                  content: nextType === 'ARTICLE' ? state.content : '',
                                }))
                                setVideoUploadProgress(0)
                                setIsVideoUploading(false)
                                setSelectedVideoName(null)
                              }}
                              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                            >
                              <option value="VIDEO">VIDEO</option>
                              <option value="ARTICLE">ARTICLE</option>
                            </select>
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">orderIndex</span>
                            <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950">
                              <button
                                type="button"
                                onClick={() => setLectureForm((state) => ({ ...state, orderIndex: String(Math.max(0, Number(state.orderIndex) - 1)) }))}
                                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <ChevronDown size={16} />
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={lectureForm.orderIndex}
                                onChange={(event) => setLectureForm((state) => ({ ...state, orderIndex: event.target.value }))}
                                className="w-16 border-0 bg-transparent text-center text-sm font-medium text-neutral-900 outline-none dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => setLectureForm((state) => ({ ...state, orderIndex: String(Number(state.orderIndex || '0') + 1) }))}
                                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <ChevronUp size={16} />
                              </button>
                            </div>
                          </label>

                          <div className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Video upload</span>
                            <input
                              type="file"
                              accept="video/*"
                              disabled={lectureForm.type !== 'VIDEO' || isVideoUploading}
                              onChange={(event) => {
                                const file = event.target.files?.[0]
                                if (file) {
                                  simulateVideoUpload(file)
                                  event.target.value = ''
                                }
                              }}
                              className="w-full cursor-pointer rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 file:mr-4 file:rounded-xl file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
                            />
                            {selectedVideoName && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">Selected file: {selectedVideoName}</p>
                            )}
                            {isVideoUploading && (
                              <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                  <span>Uploading mock video...</span>
                                  <span>{videoUploadProgress}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-200"
                                    style={{ width: `${videoUploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            <label className="space-y-2 block">
                              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">Video URL</span>
                              <input
                                value={lectureForm.videoUrl}
                                onChange={(event) => setLectureForm((state) => ({ ...state, videoUrl: event.target.value }))}
                                disabled={lectureForm.type !== 'VIDEO'}
                                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:disabled:bg-neutral-900"
                                placeholder="https://..."
                              />
                            </label>
                          </div>

                          <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Content</span>
                            <textarea
                              value={lectureForm.content}
                              onChange={(event) => setLectureForm((state) => ({ ...state, content: event.target.value }))}
                              disabled={lectureForm.type !== 'ARTICLE'}
                              rows={4}
                              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:disabled:bg-neutral-900"
                              placeholder="Lecture content"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Duration (minutes)</span>
                            <input
                              type="number"
                              min="0"
                              value={lectureForm.duration}
                              onChange={(event) => setLectureForm((state) => ({ ...state, duration: event.target.value }))}
                              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                              placeholder="15"
                            />
                          </label>

                          <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/50">
                            <input
                              type="checkbox"
                              checked={lectureForm.isPreview}
                              onChange={(event) => setLectureForm((state) => ({ ...state, isPreview: event.target.checked }))}
                              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Preview lecture</span>
                          </label>

                          <div className="flex items-center justify-end gap-3 md:col-span-2">
                            <button
                              type="button"
                              onClick={() => {
                                setLectureFormSectionId(null)
                                setLectureForm(defaultCreateLectureForm)
                              }}
                              className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleCreateLecture(section.id)}
                              disabled={!lectureForm.title.trim()}
                              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Plus size={16} />
                              Save Lecture
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {section.lectures?.length ? (
                        [...section.lectures]
                          .sort((left, right) => left.orderIndex - right.orderIndex)
                          .map((lecture) => (
                            <div
                              key={lecture.id}
                              className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40 md:flex-row md:items-center md:justify-between"
                            >
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="rounded-2xl bg-white p-2 text-primary-600 shadow-sm dark:bg-neutral-900 dark:text-primary-300">
                                  {lecture.type === 'VIDEO' ? <Video size={18} /> : <FileText size={18} />}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="truncate font-semibold text-neutral-900 dark:text-white">{lecture.title}</h4>
                                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                      {lecture.type}
                                    </span>
                                    {lecture.isPreview && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                        <CheckCircle2 size={12} />
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-neutral-500 dark:text-neutral-400">order {lecture.orderIndex}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end md:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleReorderLecture(section.id, lecture.id, -1)}
                                  className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                                  title="Move lecture up"
                                >
                                  <ChevronUp size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReorderLecture(section.id, lecture.id, 1)}
                                  className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                                  title="Move lecture down"
                                >
                                  <ChevronDown size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                          No lectures yet in this section.
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
