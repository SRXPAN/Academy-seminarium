import { useEffect, useState } from 'react'
import { GraduationCap, BookOpen, Loader2 } from 'lucide-react'
import { fetchEnrolledCourses, type CourseSummary } from '@/services/courses.service'
import CourseCard from '@/components/marketplace/CourseCard'

export default function MyLearning() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchEnrolledCourses()
        setCourses(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load courses')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            My Learning
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            All the courses you've enrolled in
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
          <GraduationCap size={20} />
          <span>{courses.length} Courses</span>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-neutral-200 py-20 text-center dark:border-neutral-800">
          <div className="rounded-full bg-neutral-100 p-6 dark:bg-neutral-900">
            <BookOpen className="h-12 w-12 text-neutral-400" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-neutral-900 dark:text-white">No courses yet</h2>
          <p className="mt-2 max-w-sm text-neutral-500 dark:text-neutral-400">
            You haven't enrolled in any courses yet. Explore our catalog to find something interesting!
          </p>
          <a
            href="/"
            className="mt-8 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Explore Courses
          </a>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              to={`/learn/${course.id}`} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
