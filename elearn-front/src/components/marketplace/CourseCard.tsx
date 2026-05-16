import { Link } from 'react-router-dom'
import { BadgeDollarSign, Clock3, Sparkles } from 'lucide-react'
import type { CourseSummary } from '@/services/courses.service'

interface CourseCardProps {
  course: CourseSummary
  to?: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function CourseCard({ course, to }: CourseCardProps) {
  const instructorName = typeof course.instructor === 'object' && course.instructor ? (course.instructor as any).name : 'Academy Seminarium'
  const coverImage = course.coverImage || ''
  const linkTo = to || `/courses/${course.id}`

  return (
    <Link
      to={linkTo}
      className="group block overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-black/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {coverImage ? (
          <img
            src={coverImage}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-end justify-between bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.35),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#334155_100%)] p-5 text-white">
            <div>
              <p className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur">
                <Sparkles size={12} /> Featured
              </p>
              <div className="mt-3 max-w-[75%] text-sm leading-5 text-white/70">
                {course.categoryId}
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
              <BadgeDollarSign size={28} className="text-white/90" />
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="line-clamp-2 text-lg font-semibold leading-6 drop-shadow-sm">
              {course.title}
            </p>
            {course.subtitle && (
              <p className="mt-1 line-clamp-1 text-sm text-white/80">
                {course.subtitle}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-black/30 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] backdrop-blur">
            {course.language}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-700 dark:text-neutral-200">
              {instructorName.slice(0, 1).toUpperCase()}
            </div>
            <span className="truncate">{instructorName}</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Clock3 size={14} /> Lifetime
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
              Price
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {formatPrice(course.price)}
            </p>
          </div>
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {course.status}
          </span>
        </div>
      </div>
    </Link>
  )
}
