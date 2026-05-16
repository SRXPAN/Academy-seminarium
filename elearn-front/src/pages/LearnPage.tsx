import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Menu, 
  PlayCircle, 
  FileText,
  CheckCircle,
  Star
} from 'lucide-react'
import ReactPlayer from 'react-player'
import { fetchCourseById, type CourseDetail } from '@/services/courses.service'
import { fetchCourseProgress, updateLectureProgress, type LectureProgress } from '@/services/progress.service'
import { cn } from '@/utils/colors'
import ReviewModal from '@/components/ReviewModal'

const SYNC_INTERVAL = 10000 // 10 seconds

export default function LearnPage() {
  const { courseId, lectureId } = useParams<{ courseId: string; lectureId?: string }>()
  const navigate = useNavigate()

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [progress, setProgress] = useState<LectureProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const lastSyncTimeRef = useRef<number>(0)

  useEffect(() => {
    async function load() {
      if (!courseId) return
      try {
        const [courseData, progressData] = await Promise.all([
          fetchCourseById(courseId),
          fetchCourseProgress(courseId)
        ])
        setCourse(courseData)
        setProgress(progressData)

        // Expand all sections by default
        const initialExpanded: Record<string, boolean> = {}
        courseData.sections.forEach(s => {
          initialExpanded[s.id] = true
        })
        setExpandedSections(initialExpanded)

        // If no lectureId in URL, redirect to first lecture
        if (!lectureId && courseData.sections[0]?.lectures[0]) {
          navigate(`/learn/${courseId}/lecture/${courseData.sections[0].lectures[0].id}`, { replace: true })
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course content')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, lectureId, navigate])

  const currentLecture = useMemo(() => {
    if (!course || !lectureId) return null
    for (const section of course.sections) {
      const found = section.lectures.find(l => l.id === lectureId)
      if (found) return { ...found, sectionId: section.id }
    }
    return null
  }, [course, lectureId])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const isCompleted = (lId: string) => progress.find(p => p.lectureId === lId)?.isCompleted || false

  const handleMarkAsComplete = async () => {
    if (!lectureId) return
    try {
      const updated = await updateLectureProgress(lectureId, 0, true)
      setProgress(prev => {
        const index = prev.findIndex(p => p.lectureId === lectureId)
        if (index > -1) {
          const newProgress = [...prev]
          newProgress[index] = updated
          return newProgress
        }
        return [...prev, updated]
      })
      
      // Auto-play next lecture logic
      autoPlayNext()
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  const autoPlayNext = () => {
    if (!course || !currentLecture) return
    
    let foundCurrent = false
    for (const section of course.sections) {
      for (const lecture of section.lectures) {
        if (foundCurrent) {
          navigate(`/learn/${courseId}/lecture/${lecture.id}`)
          return
        }
        if (lecture.id === lectureId) {
          foundCurrent = true
        }
      }
    }
  }

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!lectureId) return
    
    // 95% threshold for auto-completion
    if (state.played >= 0.95 && !isCompleted(lectureId)) {
      void handleMarkAsComplete()
      return
    }

    const now = Date.now()
    if (now - lastSyncTimeRef.current >= SYNC_INTERVAL) {
      void updateLectureProgress(lectureId, Math.floor(state.playedSeconds), isCompleted(lectureId))
      lastSyncTimeRef.current = now
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Error</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{error || 'Course not found'}</p>
        <Link to="/my-courses" className="mt-6 text-primary-600 hover:underline">Back to My Learning</Link>
      </div>
    )
  }

  const Player = ReactPlayer as any

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-neutral-950">
      {/* Sidebar - Curriculum */}
      <aside className={cn(
        "flex flex-col border-r border-neutral-200 bg-neutral-50 transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900",
        isSidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="font-bold text-neutral-900 dark:text-white">Course Content</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded">
            <Menu size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {course.sections.map((section) => (
            <div key={section.id} className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between bg-neutral-100/50 p-4 hover:bg-neutral-200/50 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50"
              >
                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{section.title}</span>
                {expandedSections[section.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections[section.id] && (
                <div className="bg-white dark:bg-neutral-900">
                  {section.lectures.map((lecture) => (
                    <Link
                      key={lecture.id}
                      to={`/learn/${courseId}/lecture/${lecture.id}`}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                        lectureId === lecture.id ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300" : "text-neutral-600 dark:text-neutral-400"
                      )}
                    >
                      <div className="shrink-0">
                        {isCompleted(lecture.id) ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          lecture.type === 'VIDEO' ? <PlayCircle size={18} /> : <FileText size={18} />
                        )}
                      </div>
                      <span className="line-clamp-2 flex-1">{lecture.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* Mobile Sidebar Toggle */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-4 z-10 p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <Link to="/my-courses" className="hover:text-primary-600">My Learning</Link>
                <span>/</span>
                <Link to={`/courses/${courseId}`} className="hover:text-primary-600 truncate max-w-[150px]">{course.title}</Link>
                {currentLecture && (
                  <>
                    <span>/</span>
                    <span className="truncate max-w-[150px] font-medium text-neutral-900 dark:text-white">{currentLecture.title}</span>
                  </>
                )}
              </nav>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all shadow-sm"
                >
                  <Star size={18} className="text-yellow-500" />
                  Leave a Review
                </button>

                <button 
                  onClick={handleMarkAsComplete}
                  disabled={!lectureId || isCompleted(lectureId)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                    isCompleted(lectureId!) 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default"
                      : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                  )}
                >
                  {isCompleted(lectureId!) ? <CheckCircle size={16} /> : null}
                  {isCompleted(lectureId!) ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>

            {currentLecture ? (
              <div className="space-y-6">
                <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                  {currentLecture.title}
                </h1>

                {currentLecture.type === 'VIDEO' ? (
                  <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-neutral-200 bg-black dark:border-neutral-800 shadow-2xl">
                    <Player
                      url={(currentLecture as any).videoUrl}
                      width="100%"
                      height="100%"
                      controls
                      onProgress={handleProgress}
                      onEnded={handleMarkAsComplete}
                    />
                  </div>
                ) : (
                  <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      {(currentLecture as any).content || 'This lecture has no content yet.'}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-neutral-500">
                Select a lecture to start learning
              </div>
            )}
          </div>
        </div>
      </main>

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)}
        courseId={courseId!}
        courseTitle={course.title}
      />
    </div>
  )
}
