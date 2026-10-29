import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Welcome to CampusFind</h1>
      <p className="mt-2 text-slate-600">
        {user
          ? `You are logged in as ${user.email} (${user.role}).`
          : 'Log in or sign up to report and find lost items on campus.'}
      </p>
    </div>
  )
}