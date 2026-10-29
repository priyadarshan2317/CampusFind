import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/errors'
import AuthCard from '../components/AuthCard'
import Field from '../components/Field'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Post what you lost or found, and get contacted directly."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-found hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {error && (
        <div role="alert" className="mb-4 rounded-xl bg-lost-soft px-4 py-3 text-sm text-lost">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" icon={User} name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
        <Field label="Email" icon={Mail} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@college.edu" autoComplete="email" required />
        <Field
          label="Phone"
          icon={Phone}
          name="phone"
          value={form.phone}
          onChange={handleChange}
          autoComplete="tel"
          hint="Shown only to logged-in students who open your posts."
        />
        <Field
          label="Password"
          icon={Lock}
          name="password"
          type={show ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={6}
          required
          hint="At least 6 characters."
          right={
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-soft transition hover:text-ink"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 font-semibold text-white transition hover:bg-found disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? 'Creating account' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  )
}