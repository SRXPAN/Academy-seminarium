import { useAuth } from '@/auth/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-6">
      <div className="card bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
            <span className="text-2xl sm:text-3xl font-display font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-display font-bold text-neutral-900 dark:text-white break-words">
              {t('dashboard.welcome', 'Welcome')}, {user?.name}!
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
              Ready to continue your learning journey?
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-display font-semibold mb-4">My Courses</h3>
          <p className="text-neutral-500">You are not enrolled in any courses yet.</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-display font-semibold mb-4">Recommended for You</h3>
          <p className="text-neutral-500">Check out our latest courses in the marketplace.</p>
        </div>
      </div>
    </div>
  )
}
