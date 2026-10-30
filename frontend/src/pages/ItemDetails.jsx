import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/errors'
import { formatDate, imageSrc, timeAgo } from '../utils/format'
import CategoryIcon from '../components/CategoryIcon'
import AdminDeleteButton from '../components/AdminDeleteButton'

const STATUS_NOTE = {
  PENDING: 'Waiting for admin approval. Only you and admins can see this post.',
  REJECTED: 'An admin did not approve this post, so it is not shown to other students.',
  CLAIMED: 'This item has been claimed by its owner.',
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-paper text-ink-soft">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs text-ink-soft">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

export default function ItemDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [state, setState] = useState({ id: null, item: null, error: '' })

  useEffect(() => {
    let ignore = false
    api
      .get(`/api/items/${id}`)
      .then(({ data }) => {
        if (!ignore) setState({ id, item: data, error: '' })
      })
      .catch((err) => {
        if (ignore) return
        const message =
          err.response?.status === 404
            ? 'We could not find this item. It may have been removed, or it is still waiting for approval.'
            : getErrorMessage(err)
        setState({ id, item: null, error: message })
      })
    return () => {
      ignore = true
    }
  }, [id])

  const loading = state.id !== id
  const { item, error } = state

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to all items
      </Link>

      {loading && (
        <div className="mt-6 grid animate-pulse gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="aspect-[4/3] rounded-3xl bg-line/60" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-line" />
            <div className="h-4 w-full rounded bg-line/70" />
            <div className="h-4 w-2/3 rounded bg-line/70" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-line bg-white px-6 py-12 text-center">
          <h1 className="font-display text-2xl font-bold">Item not available</h1>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">{error}</p>
        </div>
      )}

      {!loading && item && (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-line bg-white">
            <div className={`h-2 ${item.type === 'FOUND' ? 'bg-found' : 'bg-lost'}`} />
            {imageSrc(item.imageUrl) ? (
              <img
                src={imageSrc(item.imageUrl)}
                alt={item.title}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div
                className={`grid aspect-[4/3] w-full place-items-center ${
                  item.type === 'FOUND' ? 'bg-found-soft text-found' : 'bg-lost-soft text-lost'
                }`}
              >
                <CategoryIcon name={item.categoryName} className="size-24 opacity-60" />
              </div>
            )}
          </div>

          <div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold text-white ${
                item.type === 'FOUND' ? 'bg-found' : 'bg-lost'
              }`}
            >
              {item.type === 'FOUND' ? 'Found' : 'Lost'}
            </span>

            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {item.title}
            </h1>

            {STATUS_NOTE[item.status] && (
              <p className="mt-4 rounded-xl bg-tag/30 px-4 py-3 text-sm font-medium">
                {STATUS_NOTE[item.status]}
              </p>
            )}

            {item.description && (
              <p className="mt-4 max-w-prose leading-relaxed text-ink-soft">{item.description}</p>
            )}

            <div className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2">
              <Fact icon={() => <CategoryIcon name={item.categoryName} className="size-4" />} label="Category" value={item.categoryName} />
              <Fact icon={MapPin} label="Place" value={item.location} />
              <Fact icon={CalendarDays} label="Date" value={formatDate(item.dateReported)} />
              <Fact icon={Clock} label="Posted" value={timeAgo(item.dateReported)} />
            </div>

            {user?.id === item.postedById ? (
                            <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5 text-sm">
                <span className="text-ink-soft">This is your post.</span>
                {item.status !== 'CLAIMED' && (
                  <Link
                    to={`/items/${item.id}/edit`}
                    className="font-semibold text-found hover:underline"
                  >
                    Edit post
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-line bg-white p-5">
                <h2 className="font-display text-lg font-bold">Contact {item.postedByName}</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {item.postedByPhone && (
                    <a
                      href={`tel:${item.postedByPhone}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-found"
                    >
                      <Phone className="size-4" />
                      {item.postedByPhone}
                    </a>
                  )}
                  {item.postedByEmail && (
                    <a
                      href={`mailto:${item.postedByEmail}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold transition hover:border-ink"
                    >
                      <Mail className="size-4" />
                      {item.postedByEmail}
                    </a>
                  )}
                </div>
                <p className="mt-4 flex items-start gap-2 text-xs text-ink-soft">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-found" />
                  Ask for proof of ownership before handing over an item, and meet in a public
                  place on campus.
                </p>
              </div>
            )}
             {user?.role === 'ADMIN' && <AdminDeleteButton id={item.id} />}
          </div>
        </div>
      )}
    </div>
  )
}