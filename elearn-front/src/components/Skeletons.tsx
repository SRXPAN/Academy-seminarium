import { Loader2 } from 'lucide-react'
import { Skeleton } from './Skeleton'

// ========================================
// Reusable Layout Skeletons
// ========================================

/** Скелетон для простої картки (3 рядки) */
export function CardSkeleton() {
  return (
    <div className="card space-y-4">
      <Skeleton variant="rectangular" height={24} width="60%" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
    </div>
  )
}

/** Скелетон картки дашборда з іконкою */
export function DashboardCardSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={8} className="rounded-full" />
    </div>
  )
}

/** Скелетон для блоку тексту */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number, className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 && lines > 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  )
}

/** Скелетон для картки контенту (зображення + текст) */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-0 overflow-hidden ${className}`}>
      <Skeleton variant="rectangular" height={160} className="rounded-none rounded-t-3xl" />
      <div className="p-6 space-y-4">
        <Skeleton variant="text" height={24} width="80%" />
        <SkeletonText lines={2} />
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rounded" height={28} width={80} />
          <Skeleton variant="rounded" height={28} width={60} />
        </div>
      </div>
    </div>
  )
}

/** Скелетон списку елементів з аватарами */
export function SkeletonList({ count = 5, className = '' }: { count?: number, className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-800">
          <Skeleton variant="circular" width={40} height={40} className="shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height={16} width="60%" />
            <Skeleton variant="text" height={12} width="40%" />
          </div>
          <Skeleton variant="rounded" height={28} width={60} />
        </div>
      ))}
    </div>
  )
}

/** Скелетон сітки статистики */
export function SkeletonStats({ count = 4, className = '' }: { count?: number, className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 flex flex-col items-center">
          <Skeleton variant="text" height={32} width="50%" className="mb-2" />
          <Skeleton variant="text" height={14} width="70%" />
        </div>
      ))}
    </div>
  )
}

/** Скелетон аватара з ім'ям */
export function SkeletonAvatar({ size = 40, showName = true, className = '' }: { size?: number, showName?: boolean, className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Skeleton variant="circular" width={size} height={size} />
      {showName && (
        <div className="space-y-1">
          <Skeleton variant="text" height={14} width={100} />
          <Skeleton variant="text" height={10} width={60} />
        </div>
      )}
    </div>
  )
}

// ========================================
// Page Specific Skeletons
// ========================================

/** Повний скелетон для Dashboard */
export function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" height={32} width={200} />
          <Skeleton variant="text" height={18} width={300} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" height={24} width="50%" />
            <Skeleton variant="text" height={12} width="70%" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Placeholder for content */}
          <div className="card h-64 p-6" />
          <SkeletonList count={3} />
        </div>

        <div className="space-y-6">
           <SkeletonList count={4} />
        </div>
      </div>
    </div>
  )
}

// ========================================
// Loaders
// ========================================

/** Повноекранний лоадер по центру */
export function PageLoader({ text = 'Завантаження...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 size={48} className="animate-spin text-primary-600 dark:text-primary-400" />
      <p className="text-neutral-600 dark:text-neutral-400 font-medium animate-pulse">{text}</p>
    </div>
  )
}

/** Простий компонент Loading (аліас для зручності) */
export function Loading({ text }: { text?: string }) {
  return <PageLoader text={text} />
}
// Alias exports for naming consistency
export { SkeletonDashboard as DashboardSkeleton }
