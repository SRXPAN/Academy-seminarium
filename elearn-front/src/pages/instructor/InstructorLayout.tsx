import { useState } from 'react'
import { Navigate, NavLink, Outlet, Link } from 'react-router-dom'
import { BarChart3, BookOpen, Settings, LogOut, Menu, X, GraduationCap, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'

const navItems = [
  { path: '/instructor/courses', label: 'My Courses', icon: BookOpen, end: true },
  { path: '/instructor/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/instructor/settings', label: 'Settings', icon: Settings },
]

export default function InstructorLayout() {
  const { user, logout } = useAuth()
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 lg:flex">
      <div className="lg:hidden flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-600/20">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Instructor</p>
            <h1 className="text-sm font-semibold">Dashboard</h1>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Menu size={22} />
        </button>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-900 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white">
              <GraduationCap size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Instructor</p>
              <p className="font-semibold text-neutral-900 dark:text-white">Course Studio</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-neutral-500 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/60"
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={18} />
            Public Home
          </Link>
          <div className="my-4 border-t border-neutral-200 dark:border-neutral-800" />
          {navItems.map(({ path, label, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/60'}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || 'I'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{user.name}</p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
