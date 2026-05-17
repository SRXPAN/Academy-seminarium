import { useAdminStats } from '@/hooks/useAdmin'
import { useTranslation } from '@/i18n/useTranslation'
import {
  Users,
  PlayCircle,
  FolderOpen,
  Activity,
  AlertCircle
} from 'lucide-react'
import { SkeletonDashboard } from '@/components/Skeletons'

export default function AdminDashboard() {
  const { stats, loading, error, refresh } = useAdminStats()
  const { t } = useTranslation()

  if (loading) {
    return <SkeletonDashboard />
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          {t('common.loadFailed', 'Failed to load stats')}
        </h3>
        <p className="text-neutral-500 mb-6 max-w-sm">
          {error || 'An unexpected error occurred while fetching system statistics.'}
        </p>
        <button
          onClick={refresh}
          className="btn flex items-center gap-2"
        >
          <Activity size={18} />
          {t('common.retry', 'Retry')}
        </button>
      </div>
    )
  }

  const statCards = [
    {
      label: t('admin.totalUsers', 'Total Users'),
      value: stats.users?.total ?? 0,
      icon: Users,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'Total Courses',
      value: stats.content?.courses ?? 0,
      icon: PlayCircle,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'Total Lectures',
      value: stats.content?.lectures ?? 0,
      icon: PlayCircle,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      label: t('admin.totalFiles', 'Total Files'),
      value: stats.content?.files ?? 0,
      icon: FolderOpen,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            {t('admin.dashboard', 'Dashboard')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('admin.dashboardDescription', 'System overview and statistics')}
          </p>
        </div>
        <button
          onClick={refresh}
          className="btn-outline self-start sm:self-auto flex items-center gap-2 text-sm"
        >
          <Activity size={16} />
          {t('common.refresh', 'Refresh')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="card p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-xl shrink-0 ${color}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Users by Role */}
        <div className="card h-full">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('admin.usersByRole', 'Users by Role')}
            </h2>
          </div>
          
          {stats.users?.byRole ? (
            <div className="space-y-4">
              {Object.entries(stats.users.byRole).map(([role, count]) => {
                const percentage = stats.users.total > 0 
                  ? Math.round((count / stats.users.total) * 100) 
                  : 0
                
                return (
                  <div key={role} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{role}</span>
                      <span className="text-gray-500">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          role === 'ADMIN' ? 'bg-purple-500' : 
                          role === 'INSTRUCTOR' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
