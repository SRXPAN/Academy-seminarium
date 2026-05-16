import { useEffect, useState } from 'react'
import { Plus, BookOpen, RefreshCcw, X, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import useInstructorStore from '@/store/instructor'
import { apiPost } from '@/lib/http'
import { courseFallbackCategories, type CourseSummary } from '@/services/courses.service'
import { useAuth } from '@/auth/AuthContext'

type CourseFormState = {
  title: string
  subtitle: string
  description: string
  price: string
  categoryId: string
  language: 'UA' | 'PL' | 'EN'
}

const initialFormState: CourseFormState = {
  title: '',
  subtitle: '',
  description: '',
  price: '',
  categoryId: courseFallbackCategories[0]?.id ?? 'Programming',
  language: 'EN',
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PENDING: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function MyCourses() {
  const { user } = useAuth()
  const { courses, loading, error, loadCourses, addCourseToList } = useInstructorStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CourseFormState>(initialFormState)

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  async function handleCreateCourse() {
    setSubmitting(true)
    try {
      const createdCourse = await apiPost<CourseSummary>('/courses', {
        title: form.title,
        subtitle: form.subtitle || undefined,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId,
        language: form.language,
      })

      addCourseToList(createdCourse)
      setIsCreateOpen(false)
      setForm(initialFormState)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-600 dark:text-primary-400">Instructor Dashboard</p>
          <h1 className="text-3xl font-display font-bold tracking-tight text-neutral-900 dark:text-white">My Courses</h1>
          <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            Manage the courses you teach, review their publishing status, and create new drafts for your next launch.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => loadCourses()}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-transform hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Create New Course
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Instructor</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{user?.name || 'Instructor'}</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Courses</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{courses.length}</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Drafts</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{courses.filter((course) => course.status === 'DRAFT').length}</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Published</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{courses.filter((course) => course.status === 'PUBLISHED').length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-3 border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div className="rounded-2xl bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Courses taught by you</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Draft, pending, and published courses appear here.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-neutral-500 dark:text-neutral-400">Loading your courses...</div>
        ) : error ? (
          <div className="p-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
              {error}
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 rounded-full bg-neutral-100 p-4 text-neutral-400 dark:bg-neutral-800">
              <BookOpen size={28} />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">No courses yet</h3>
            <p className="mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
              Create your first draft course to start building your curriculum.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Plus size={16} />
              Create New Course
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-left dark:divide-neutral-800">
              <thead className="bg-neutral-50 text-xs uppercase tracking-[0.18em] text-neutral-500 dark:bg-neutral-950/60 dark:text-neutral-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Sections</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {courses.map((course) => (
                  <tr key={course.id} className="transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-neutral-900 dark:text-white">{course.title}</p>
                        {course.subtitle && <p className="text-sm text-neutral-500 dark:text-neutral-400">{course.subtitle}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">{formatPrice(course.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusStyles[course.status] || statusStyles.DRAFT}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">{course._count?.sections ?? 0}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/instructor/courses/${course.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
                      >
                        <Pencil size={14} />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => !submitting && setIsCreateOpen(false)} />
          <div className="relative z-[101] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Create New Course</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Start with a draft and refine it later.</p>
              </div>
              <button
                onClick={() => !submitting && setIsCreateOpen(false)}
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Title</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                  placeholder="Course title"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Subtitle</span>
                <input
                  value={form.subtitle}
                  onChange={(event) => setForm((state) => ({ ...state, subtitle: event.target.value }))}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                  placeholder="Short marketing subtitle"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                  placeholder="Describe the course..."
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Price</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(event) => setForm((state) => ({ ...state, price: event.target.value }))}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                  placeholder="49"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Language</span>
                <select
                  value={form.language}
                  onChange={(event) => setForm((state) => ({ ...state, language: event.target.value as CourseFormState['language'] }))}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                >
                  <option value="EN">English</option>
                  <option value="UA">Ukrainian</option>
                  <option value="PL">Polish</option>
                </select>
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</span>
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm((state) => ({ ...state, categoryId: event.target.value }))}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                >
                  {courseFallbackCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <button
                onClick={() => setIsCreateOpen(false)}
                disabled={submitting}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                disabled={submitting || !form.title.trim() || !form.description.trim() || !form.price.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} />
                {submitting ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
