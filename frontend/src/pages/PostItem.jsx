import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CalendarDays, Loader2, MapPin, Tag } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/errors'
import Field from '../components/Field'
import ImageUpload from '../components/ImageUpload'
import ItemCard from '../components/ItemCard'
import CategoryIcon from '../components/CategoryIcon'

const TYPE_OPTIONS = [
  {
    value: 'LOST',
    title: 'I lost something',
    hint: 'Help a finder reach you',
    selected: 'border-lost bg-lost-soft',
  },
  {
    value: 'FOUND',
    title: 'I found something',
    hint: 'Help the owner find it',
    selected: 'border-found bg-found-soft',
  },
]

const todayString = () => new Date().toLocaleDateString('en-CA')

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-found focus:ring-4 focus:ring-found/15'

export default function PostItem() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const today = todayString()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    type: searchParams.get('type') === 'FOUND' ? 'FOUND' : 'LOST',
    title: '',
    description: '',
    categoryId: '',
    location: '',
    dateReported: today,
  })
  const [file, setFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [loadState, setLoadState] = useState({ id: null, error: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  useEffect(() => {
    api
      .get('/api/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    let ignore = false
    api
      .get(`/api/items/${id}`)
      .then(({ data }) => {
        if (ignore) return
        if (data.postedById !== user.id) {
          setLoadState({ id, error: 'You can only edit your own posts.' })
          return
        }
        if (data.status === 'CLAIMED') {
          setLoadState({ id, error: 'Claimed items cannot be edited.' })
          return
        }
        setForm({
          type: data.type,
          title: data.title,
          description: data.description || '',
          categoryId: String(data.categoryId),
          location: data.location,
          dateReported: data.dateReported,
        })
        setImageUrl(data.imageUrl || '')
        setLoadState({ id, error: '' })
      })
      .catch((err) => {
        if (!ignore) setLoadState({ id, error: getErrorMessage(err) })
      })
    return () => {
      ignore = true
    }
  }, [id, user.id])

  const loading = isEdit && loadState.id !== id

  const update = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.categoryId) {
      setError('Choose a category so people can find your post.')
      return
    }

    setSaving(true)
    try {
      let finalUrl = imageUrl
      if (file) {
        const body = new FormData()
        body.append('file', file)
        const { data } = await api.post('/api/files/upload', body)
        finalUrl = data.url
      }

      const payload = {
        ...form,
        title: form.title.trim(),
        location: form.location.trim(),
        categoryId: Number(form.categoryId),
        imageUrl: finalUrl || null,
      }

      if (isEdit) {
        await api.put(`/api/items/${id}`, payload)
      } else {
        await api.post('/api/items', payload)
      }

      navigate('/my-posts', {
        state: {
          notice: isEdit
            ? 'Changes saved. Your post is back in review.'
            : 'Post submitted. It appears on the home page once an admin approves it.',
        },
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-8">
        <div className="h-9 w-64 rounded bg-line" />
        <div className="mt-6 h-96 rounded-3xl bg-line/60" />
      </div>
    )
  }

  if (isEdit && loadState.error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="font-display text-2xl font-bold">This post can’t be edited</h1>
        <p className="mt-2 text-ink-soft">{loadState.error}</p>
        <Link
          to="/my-posts"
          className="mt-5 inline-block rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-found"
        >
          Back to my posts
        </Link>
      </div>
    )
  }

  const category = categories.find((c) => String(c.id) === String(form.categoryId))
  const previewItem = {
    id: 0,
    type: form.type,
    title: form.title.trim() || 'Your item title',
    categoryName: category?.name || 'Category',
    location: form.location.trim() || 'Where it happened',
    dateReported: form.dateReported || today,
    imageUrl: preview || imageUrl,
  }

  const heading = isEdit
    ? 'Edit your post'
    : form.type === 'LOST'
      ? 'Report a lost item'
      : 'Report a found item'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{heading}</h1>
      <p className="mt-1.5 text-ink-soft">
        An admin reviews every post before it appears on the home page.
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-line bg-white p-6 sm:p-8"
        >
          {error && (
            <div role="alert" className="rounded-xl bg-lost-soft px-4 py-3 text-sm text-lost">
              {error}
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium">What happened?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update('type', option.value)}
                  aria-pressed={form.type === option.value}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    form.type === option.value
                      ? option.selected
                      : 'border-line bg-white hover:border-ink/40'
                  }`}
                >
                  <span className="block font-display text-lg font-bold">{option.title}</span>
                  <span className="text-sm text-ink-soft">{option.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <Field
            label="Item name"
            icon={Tag}
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Black Samsung phone with blue cover"
            maxLength={100}
            required
          />

          <div>
            <p className="mb-2 text-sm font-medium">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => update('categoryId', String(c.id))}
                  aria-pressed={String(c.id) === form.categoryId}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                    String(c.id) === form.categoryId
                      ? 'border-ink bg-ink text-white'
                      : 'border-line bg-white text-ink-soft hover:border-ink hover:text-ink'
                  }`}
                >
                  <CategoryIcon name={c.name} className="size-4" />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={form.type === 'LOST' ? 'Where did you lose it?' : 'Where did you find it?'}
              icon={MapPin}
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Library, second floor"
              required
            />
            <Field
              label="Date"
              icon={CalendarDays}
              type="date"
              max={today}
              value={form.dateReported}
              onChange={(e) => update('dateReported', e.target.value)}
              required
            />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Description</span>
            <textarea
              rows={4}
              maxLength={1000}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Colour, brand, marks or anything that helps prove it is yours. Leave out private details like card numbers."
              className={inputClass}
            />
            <span className="mt-1 block text-right text-xs text-ink-soft">
              {form.description.length} / 1000
            </span>
          </label>

          <div>
            <p className="mb-2 text-sm font-medium">Photo (optional)</p>
            <ImageUpload
              src={preview || (imageUrl ? previewItem.imageUrl : null)}
              onPick={setFile}
              onClear={() => {
                setFile(null)
                setImageUrl('')
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-ink px-6 py-3 font-semibold text-white transition hover:bg-found disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? 'Saving' : isEdit ? 'Save changes' : 'Submit for review'}
            </button>
            <Link
              to={isEdit ? '/my-posts' : '/'}
              className="rounded-xl px-4 py-3 text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              Cancel
            </Link>
          </div>
        </form>

        <aside className="lg:sticky lg:top-24">
          <h2 className="mb-3 font-display text-lg font-bold">Live preview</h2>
          <div className="pointer-events-none">
            <ItemCard item={previewItem} />
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            This is how your post will look on the home page.
          </p>
        </aside>
      </div>
    </div>
  )
}