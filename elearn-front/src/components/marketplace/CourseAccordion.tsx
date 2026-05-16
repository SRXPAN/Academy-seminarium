import { useState } from 'react'
import { ChevronDown, PlayCircle, FileText } from 'lucide-react'
import type { CourseSection } from '@/services/courses.service'

interface CourseAccordionProps {
  sections: CourseSection[]
}

function LectureTypeBadge({ type }: { type: string }) {
  const isVideo = type === 'VIDEO'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isVideo ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
      {isVideo ? <PlayCircle size={12} className="mr-1" /> : <FileText size={12} className="mr-1" />}
      {type}
    </span>
  )
}

export default function CourseAccordion({ sections }: CourseAccordionProps) {
  const [openSectionId, setOpenSectionId] = useState<string | null>(sections[0]?.id ?? null)

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const isOpen = openSectionId === section.id

        return (
          <div key={section.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => setOpenSectionId(isOpen ? null : section.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
            >
              <div>
                <p className="text-base font-semibold text-neutral-900 dark:text-white">
                  {section.title}
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {section.lectures.length} lectures
                </p>
              </div>
              <ChevronDown size={18} className={`shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
                <ul className="space-y-3">
                  {section.lectures.map((lecture) => (
                    <li key={lecture.id} className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800/60">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                          {lecture.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <LectureTypeBadge type={lecture.type} />
                          {lecture.isPreview && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              Preview
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}