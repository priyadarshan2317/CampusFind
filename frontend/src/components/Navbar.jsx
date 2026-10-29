import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Tag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative grid size-9 place-items-center rounded-xl bg-ink text-white">
            <Tag className="size-[18px]" />
            <span className="absolute -right-1 -top-1 size-3 rounded-full bg-tag ring-2 ring-paper" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">CampusFind</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full bg-found-soft font-display font-bold text-found">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-ink-soft">{user.role === 'ADMIN' ? 'Admin' : 'Student'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium transition hover:border-ink"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-white"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-found"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}