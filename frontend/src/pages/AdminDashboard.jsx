import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Check, MapPin, PartyPopper, RefreshCw, User, X } from 'lucide-react'
import api from '../api/axios'
import { getErrorMessage } from '../utils/errors'
import { imageSrc, timeAgo } from '../utils/format'
import CategoryIcon from '../components/CategoryIcon'

const SEGMENTS = [
  { key: 'pending', label: 'In review', color: 'bg-tag' },
  { key: 'approved', label: 'Live', color: 'bg-found' },
  { key: 'claimed', label: 'Claimed', color: 'bg-slate-400' },
  { key: 'rejected', label: 'Not approved', color: 'bg-lost' },
]

function ReviewCard({ item, busy, onReview }) {
  const [confirmReject, setConfirmReject] = useState(false)
  const found = item.type === 'FOUND'
  const src = imageSrc(item.imageUrl)

  return (
    <li className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          to={`/items/${item.id}`}
          className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl sm:w-44"
        >
          {src ? (
            <img src={src} alt={item.title} className="size-full object-cover" />
          ) : (
            <span
              className={`grid size-full place-items-center ${
                found ? 'bg-found-soft text-found' : 'bg-lost-soft text-lost'
              }`}
            >
              <CategoryIcon name={item.categoryName} className="size-10 opacity-70" />
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
                found ? 'bg-found' : 'bg-lost'
              }`}
            >
              {found ? 'Found' : 'Lost'}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-0.5 text-xs font-medium text-ink-soft">
              <CategoryIcon name={item.categoryName} className="size-3.5" />
              {item.categoryName}
            </span>
          </div>

          <Link
            to={`/items/${item.id}`}
            className="mt-2 block font-display text-lg font-bold leading-snug hover:text-found"
          >
            {item.title}
          </Link>

          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{item.description}</p>
          )}

          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-soft">
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {item.location}
            </li>
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {timeAgo(item.dateReported)}
            </li>
            <li className="flex items-center gap-1.5">
              <User className="size-4" />
              {item.postedByName} ({item.postedByEmail})
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4 text-sm font-semibold">
        {confirmReject ? (
          <>
            <span className="mr-auto font-medium text-ink-soft">
              Reject this post? The owner will see it as not approved.
            </span>
            <button
              onClick={() => onReview(item.id, 'reject')}
              disabled={busy}
              className="rounded-lg bg-lost px-3.5 py-2 text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Rejecting' : 'Yes, reject'}
            </button>
            <button
              onClick={() => setConfirmReject(false)}
              className="rounded-lg px-3.5 py-2 text-ink-soft transition hover:text-ink"
            >
              Keep reviewing
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setConfirmReject(true)}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-lost transition hover:border-lost hover:bg-lost-soft disabled:opacity-60"
            >
              <X className="size-4" />
              Reject
            </button>
            <button
              onClick={() => onReview(item.id, 'approve')}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg bg-found px-3.5 py-2 text-white transition hover:brightness-110 disabled:opacity-60"
            >
              <Check className="size-4" />
              {busy ? 'Approving' : 'Approve'}
            </button>
          </>
        )}
      </div>
    </li>
  )
}

export default function AdminDashboard() {
  const [reload, setReload] = useState(0)
  const [data, setData] = useState({ key: -1, stats: null, pending: [], error: '' })
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let ignore = false
    Promise.all([api.get('/api/admin/stats'), api.get('/api/admin/pending')])
      .then(([statsRes, pendingRes]) => {
        if (!ignore) {
          setData({ key: reload, stats: statsRes.data, pending: pendingRes.data, error: '' })
        }
      })
      .catch((err) => {
        if (!ignore) {
          setData({ key: reload, stats: null, pending: [], error: getErrorMessage(err) })
        }
      })
    return () => {
      ignore = true
    }
  }, [reload])

  const loading = data.key !== reload
  const { stats, pending, error } = data

  const review = async (id, action) => {
    setBusyId(id)
    setActionError('')
    try {
      await api.patch(`/api/admin/items/${id}/${action}`)
      setData((d) => ({
        ...d,
        pending: d.pending.filter((item) => item.id !== id),
        stats: d.stats && {
          ...d.stats,
          pending: d.stats.pending - 1,
          approved: d.stats.approved + (action === 'approve' ? 1 : 0),
          rejected: d.stats.rejected + (action === 'reject' ? 1 : 0),
        },
      }))
      setNotice(action === 'approve' ? 'Post approved. It is now live.' : 'Post rejected.')
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Admin dashboard</h1>
          <p className="mt-1.5 text-ink-soft">Review new posts before they go live.</p>
        </div>
        <button
          onClick={() => setReload((r) => r + 1)}
          className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium transition hover:border-ink"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl bg-lost-soft px-4 py-3 text-sm text-lost">
          {error}
        </div>
      )}

      {loading && !stats && (
        <div className="mt-6 animate-pulse space-y-6">
          <div className="h-52 rounded-3xl bg-line/60" />
          <div className="h-40 rounded-2xl bg-line/60" />
        </div>
      )}

      {stats && (
        <section className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Posts by status</h2>
            <p className="text-sm text-ink-soft">{stats.totalItems} in total</p>
          </div>

          <div
            className="mt-5 flex h-4 overflow-hidden rounded-full bg-paper"
            role="img"
            aria-label="Posts by status"
          >
            {SEGMENTS.map((s) =>
              stats[s.key] > 0 ? (
                <div
                  key={s.key}
                  className={s.color}
                  style={{ width: `${(stats[s.key] / stats.totalItems) * 100}%` }}
                />
              ) : null,
            )}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SEGMENTS.map((s) => (
              <div key={s.key} className="flex items-start gap-2.5">
                <span className={`mt-1.5 size-3 shrink-0 rounded-full ${s.color}`} />
                <div>
                  <dt className="text-sm text-ink-soft">{s.label}</dt>
                  <dd className="font-display text-2xl font-bold">{stats[s.key]}</dd>
                </div>
              </div>
            ))}
          </dl>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-4">
            {[
              ['Total posts', stats.totalItems],
              ['Lost items', stats.lostItems],
              ['Found items', stats.foundItems],
              ['Registered users', stats.totalUsers],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-ink-soft">{label}</dt>
                <dd className="font-display text-xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">
          Waiting for review{stats ? ` (${pending.length})` : ''}
        </h2>

        {notice && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-found-soft px-4 py-3 text-sm text-found">
            <span>{notice}</span>
            <button onClick={() => setNotice('')} aria-label="Dismiss message">
              <X className="size-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div role="alert" className="mt-4 rounded-xl bg-lost-soft px-4 py-3 text-sm text-lost">
            {actionError}
          </div>
        )}

        {!loading && !error && pending.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
            <PartyPopper className="mx-auto size-10 text-found" />
            <h3 className="mt-4 font-display text-xl font-bold">Everything is reviewed</h3>
            <p className="mx-auto mt-2 max-w-sm text-ink-soft">
              New posts from students appear here, oldest first.
            </p>
          </div>
        )}

        <ul className="mt-4 space-y-4">
          {pending.map((item) => (
            <ReviewCard
              key={item.id}
              item={item}
              busy={busyId === item.id}
              onReview={review}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}