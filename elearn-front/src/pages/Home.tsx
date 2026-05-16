import { useEffect } from 'react'
import { Search, Sparkles, SlidersHorizontal, RotateCcw } from 'lucide-react'
import useCatalogStore from '@/store/catalog'
import { useTranslation } from '@/i18n/useTranslation'
import CourseCard from '@/components/marketplace/CourseCard'
import { courseFallbackCategories } from '@/services/courses.service'

const CATEGORY_LABELS: Record<string, string> = {
  Programming: 'category.programming',
  Mathematics: 'category.mathematics',
  Databases: 'category.databases',
  Networks: 'category.networks',
  WebDevelopment: 'category.webDevelopment',
  MobileDevelopment: 'category.mobileDevelopment',
  MachineLearning: 'category.machineLearning',
  Security: 'category.security',
  DevOps: 'category.devops',
  OperatingSystems: 'category.operatingSystems',
}

function getCategoryLabel(categoryId: string, fallbackName: string, t: any) {
  return t(CATEGORY_LABELS[categoryId] || `category.${categoryId}`, fallbackName)
}

export default function Home() {
  const { t } = useTranslation()
  const {
    courses,
    categories,
    searchQuery,
    selectedCategoryId,
    marketplaceLoading,
    marketplaceError,
    setSearchQuery,
    setSelectedCategoryId,
    resetMarketplaceFilters,
    loadPublishedCourses,
    loadCategories,
  } = useCatalogStore()

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPublishedCourses()
    }, 250)

    return () => window.clearTimeout(timer)
  }, [searchQuery, selectedCategoryId, loadPublishedCourses])

  const visibleCategories = categories.length > 0 ? categories : courseFallbackCategories

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#111827_46%,_#1e293b_100%)] px-6 py-8 text-white shadow-2xl shadow-sky-950/20 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="absolute -right-16 top-4 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white/85 backdrop-blur">
              <Sparkles size={14} /> {t('app.name', 'Academy Seminarium')}
            </p>
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Discover courses that move your career forward.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/75 sm:lg">
                Search a curated public catalog, filter by category, and explore published courses from real instructors.
              </p>
            </div>

            <div className="max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-3 shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-neutral-900 shadow-inner shadow-slate-900/5 dark:bg-neutral-950 dark:text-white">
                <Search size={18} className="shrink-0 text-sky-500" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t('search.fullPlaceholder', 'Search topics, instructors, and titles...')}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 sm:text-base"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-white/90">
                <div className="rounded-2xl bg-white/10 p-3">
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-white/55">Filters</p>
                  <p className="text-lg font-semibold">Published only</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/70">
                Use category pills below to narrow the catalog and keep the storefront focused on active offerings.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.25em] text-white/55">Catalog</p>
              <p className="mt-2 text-3xl font-black">{courses.length}</p>
              <p className="mt-1 text-sm text-white/70">courses matched by your current filters</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
              Categories
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Browse the storefront
            </h2>
          </div>
          <button
            type="button"
            onClick={resetMarketplaceFilters}
            className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <RotateCcw size={16} /> Reset filters
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedCategoryId === null
                ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 dark:bg-white dark:text-neutral-900'
                : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white'
            }`}
          >
            All categories
          </button>

          {visibleCategories.map((category) => {
            const active = selectedCategoryId === category.id
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-sky-200 hover:text-sky-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-sky-900/60 dark:hover:text-sky-300'
                }`}
              >
                {getCategoryLabel(category.id, category.name, t)}
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
              Marketplace
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Published courses
            </h2>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {marketplaceLoading ? 'Updating catalog…' : `${courses.length} results`}
          </p>
        </div>

        {marketplaceError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {marketplaceError}
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {!marketplaceLoading && courses.length === 0 && !marketplaceError && (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">No published courses found</p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Try a different search term or category filter.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
