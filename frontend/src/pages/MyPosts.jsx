import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CalendarDays, MapPin, Plus, X } from 'lucide-react'
import api from '../api/axios'
import { getErrorMessage } from '../utils/errors'
import { imageSrc, timeAgo } from '../utils/format'
import StatusBadge from '../components/StatusBadge'
import CategoryIcon from '../components/CategoryIcon'

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'APPROVED', label: 'Live' },
  { value: 'PENDING', label: 'In review' },
  { value: 'CLAIMED', label: 'Claimed' },
  { value: 'REJECTED', label: 'Not approved' },
]

export default function MyPosts() {
  const location = useLocation()
  const [state, setState] = useState({ items: null, error: '' })
  const [filter, setFilter] = useState('ALL')
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let ignore = false
    api
      .get('/api/items/my')
      .then(({ data }) => {
        if (!ignore) setState({ items: data, error: '' })
      })
      .catch((err) => {
        if (!ignore) setState({ items: [], error: getErrorMessage(err) })
      })
    return () => {
      ignore = true
    }
  }, [])

  const items = state.items
  const loading = items === null

  const counts = useMemo(() => {
    const result = { ALL: 0, APPROVED: 0, PENDING: 0, CLAIMED: 0, REJECTED: 0 }
    ;(items || []).forEach((item) => {
      result.ALL += 1
      result[item.status] += 1
    })
    return result
  }, [items])

  const visible = (items || []).filter((item) => filter === 'ALL' || item.status === filter)

  const confirmAction = async () => {
    const { id, kind } = pending
    setBusy(true)
    setActionError('')
    try {
      if (kind === 'delete') {
        await api.delete(`/api/items/${id}`)
        setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) }))
        setNotice('Post deleted.')
      } else {
        const { data } = await api.patch(`/api/items/${id}/claim`)
        setState((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? data : i)) }))
        setNotice('Marked as claimed. Thanks for closing the loop.')
      }
      setPending(null)
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">My posts</h1>
          <p className="mt-1.5 text-ink-soft">Track, edit and close the items you have reported.</p>
        </div>
        <Link
          to="/post"
          className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-found"
        >
          <Plus className="size-4" />
          Report an item
        </Link>
      </div>

      {notice && (
        <div className="mt-6 flex items-start justify-between gap-3 rounded-xl bg-found-soft px-4 py-3 text-sm text-found">
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

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              filter === f.value
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-ink-soft hover:border-ink hover:text-ink'
            }`}
          >
            {f.label} ({counts[f.value]})
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-6 space-y-4 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-line/60" />
          ))}
        </div>
      )}

      {!loading && state.error && (
        <div className="mt-6 rounded-xl bg-lost-soft px-4 py-3 text-sm text-lost">{state.error}</div>
      )}

      {!loading && !state.error && visible.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
          <h2 className="font-display text-xl font-bold">
            {counts.ALL === 0 ? 'You have not posted anything yet' : 'Nothing in this view'}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-ink-soft">
            {counts.ALL === 0
              ? 'Lost something, or found something that is not yours? Post it so the right person can find it.'
              : 'Try another tab to see your other posts.'}
          </p>
          {counts.ALL === 0 && (
            <div className="mt-5 flex justify-center gap-3 text-sm font-semibold">
              <Link
                to="/post?type=LOST"
                className="rounded-xl bg-lost px-4 py-2.5 text-white transition hover:brightness-110"
              >
                I lost something
              </Link>
              <Link
                to="/post?type=FOUND"
                className="rounded-xl bg-found px-4 py-2.5 text-white transition hover:brightness-110"
              >
                I found something
              </Link>
            </div>
          )}
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {visible.map((item) => {
          const found = item.type === 'FOUND'
          const src = imageSrc(item.imageUrl)
          const isPending = pending?.id === item.id

          return (
            <li
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center"
            >
              <Link
                to={`/items/${item.id}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-xl"
              >
                {src ? (
                  <img src={src} alt={item.title} className="size-full object-cover" />
                ) : (
                  <span
                    className={`grid size-full place-items-center ${
                      found ? 'bg-found-soft text-found' : 'bg-lost-soft text-lost'
                    }`}
                  >
                    <CategoryIcon name={item.categoryName} className="size-9 opacity-70" />
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
                  <StatusBadge status={item.status} />
                </div>
                <Link
                  to={`/items/${item.id}`}
                  className="mt-1.5 block truncate font-display text-lg font-bold hover:text-found"
                >
                  {item.title}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    {timeAgo(item.dateReported)}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm font-medium sm:justify-end">
                {isPending ? (
                  <>
                    <span className="text-ink-soft">
                      {pending.kind === 'delete' ? 'Delete this post?' : 'Mark as claimed?'}
                    </span>
                    <button
                      onClick={confirmAction}
                      disabled={busy}
                      className={`rounded-lg px-3 py-1.5 text-white transition disabled:opacity-60 ${
                        pending.kind === 'delete' ? 'bg-lost' : 'bg-found'
                      }`}
                    >
                      {busy ? 'Working' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setPending(null)}
                      className="rounded-lg px-3 py-1.5 text-ink-soft transition hover:text-ink"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {item.status === 'APPROVED' && (
                      <button
                        onClick={() => setPending({ id: item.id, kind: 'claim' })}
                        className="rounded-lg bg-found-soft px-3 py-1.5 text-found transition hover:brightness-95"
                      >
                        {found ? 'Handed to owner' : 'I got it back'}
                      </button>
                    )}
                    {item.status !== 'CLAIMED' && (
                      <Link
                        to={`/items/${item.id}/edit`}
                        className="rounded-lg border border-line px-3 py-1.5 transition hover:border-ink"
                      >
                        Edit
                      </Link>
                    )}
                    <button
                      onClick={() => setPending({ id: item.id, kind: 'delete' })}
                      className="rounded-lg px-3 py-1.5 text-lost transition hover:bg-lost-soft"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}