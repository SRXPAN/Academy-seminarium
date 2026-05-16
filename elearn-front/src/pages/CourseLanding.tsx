import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  BadgeDollarSign, 
  BookOpenText, 
  CheckCircle2, 
  PlayCircle, 
  GraduationCap, 
  Sparkles,
  ArrowRight
} from 'lucide-react'
import useCatalogStore from '@/store/catalog'
import CourseAccordion from '@/components/marketplace/CourseAccordion'
import { createCheckoutSession } from '@/services/courses.service'
import { useAuth } from '@/auth/AuthContext'

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function deriveObjectives(description: string, fallbackTitle: string): string[] {
  const rawParts = description
    .split(/[\n•\-;]+/)
    .map(part => part.trim())
    .filter(Boolean)

  if (rawParts.length >= 3) {
    return rawParts.slice(0, 6)
  }

  return [
    `Understand the core ideas behind ${fallbackTitle}`,
    'Build practical knowledge you can use immediately',
    'Follow a structured curriculum from basics to implementation',
  ]
}

export default function CourseLanding() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const { courseDetails, marketplaceLoading, marketplaceError, loadCourseDetails } = useCatalogStore()
  const course = id ? courseDetails[id] : undefined

  useEffect(() => {
    if (!id) return
    void loadCourseDetails(id)
  }, [id, loadCourseDetails])

  const objectives = useMemo(() => {
    if (!course) return []
    return course.objectives?.length ? course.objectives : deriveObjectives(course.description, course.title)
  }, [course])

  const handleEnrollClick = async () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${id}`)
      return
    }

    if (course?.isEnrolled) {
      navigate(`/learn/${id}`)
      return
    }

    try {
      setIsRedirecting(true)
      const { url } = await createCheckoutSession(id!)
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setIsRedirecting(false)
    }
  }

  if (!id) {
    return null
  }

  if (marketplaceLoading && !course) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-neutral-500 dark:text-neutral-400">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
          <p className="text-sm">Loading course…</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">Course not found</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
          We couldn’t load this course.
        </h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400">
          The course may have been removed or is not available yet.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <ArrowLeft size={16} /> Go back
        </button>
        {marketplaceError && <p className="mt-4 text-sm text-red-600">{marketplaceError}</p>}
      </div>
    )
  }

  const instructorName = typeof course.instructor === 'object' && course.instructor ? (course.instructor as any).name : 'Academy Seminarium'

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white">
          <ArrowLeft size={16} /> Back to catalog
        </Link>
        <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          <Sparkles size={12} /> Public course page
        </p>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/30">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[320px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.28),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#111827_45%,_#1f2937_100%)] p-6 sm:p-8 lg:p-10 text-white">
            <div className="absolute -right-16 top-8 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 backdrop-blur">
                  <GraduationCap size={14} /> {instructorName}
                </p>
                <div className="max-w-3xl space-y-3">
                  <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {course.title}
                  </h1>
                  {course.subtitle && (
                    <p className="text-lg leading-7 text-white/75 sm:text-xl">
                      {course.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/75">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                  <PlayCircle size={14} /> {course.sections.length} sections
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                  <BookOpenText size={14} /> {course.sections.reduce((count, section) => count + section.lectures.length, 0)} lectures
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                  {course.language}
                </span>
              </div>
            </div>
          </div>

          <aside className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:p-10">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">Price</p>
                <div className="mt-2 flex items-end gap-3">
                  <p className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
                    {formatPrice(course.price)}
                  </p>
                  <p className="pb-1 text-sm text-neutral-500 dark:text-neutral-400">Lifetime access</p>
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white">
                    {instructorName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-neutral-400">Instructor</p>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-white">{instructorName}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnrollClick}
              disabled={isRedirecting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {course.isEnrolled ? (
                <>
                  Go to Course <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <BadgeDollarSign size={18} /> {isRedirecting ? 'Redirecting...' : `Buy Course for ${formatPrice(course.price)}`}
                </>
              )}
            </button>
          </aside>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
            <CheckCircle2 size={16} /> Content
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p className="whitespace-pre-line text-base leading-7 text-neutral-700 dark:text-neutral-300">
              {course.description}
            </p>

            <div className="mt-6">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                Objectives
              </h2>
              <ul className="mt-4 space-y-3">
                {objectives.map((objective) => (
                  <li key={objective} className="flex items-start gap-3 rounded-2xl bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
            <PlayCircle size={16} /> Curriculum
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
            <CourseAccordion sections={course.sections} />
          </div>
        </div>
      </section>
    </div>
  )
}
