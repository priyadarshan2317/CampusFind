import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Search, SearchX } from 'lucide-react'
import api from '../api/axios'
import { getErrorMessage } from '../utils/errors'
import ItemCard from '../components/ItemCard'
import CategoryIcon from '../components/CategoryIcon'

function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

const TYPES = [
  { value: '', label: 'All items' },
  { value: 'LOST', label: 'Lost' },
  { value: 'FOUND', label: 'Found' },
]

function SampleTag({ className, tone, title, place }) {
  const found = tone === 'found'
  return (
    <div className={`w-60 rounded-2xl border border-line bg-white p-4 shadow-lg ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            found ? 'bg-found-soft text-found' : 'bg-lost-soft text-lost'
          }`}
        >
          {found ? 'Found' : 'Lost'}
        </span>
        <span className="size-3.5 rounded-full border-2 border-line bg-paper" />
      </div>
      <p className="font-display text-lg font-bold leading-tight">{title}</p>
      <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
        <MapPin className="size-3.5" />
        {place}
      </p>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-line bg-white">
      <div className="h-1.5 bg-line" />
      <div className="aspect-[4/3] bg-line/60" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-line" />
        <div className="h-3.5 w-1/2 rounded bg-line/70" />
        <div className="h-3.5 w-2/3 rounded bg-line/70" />
      </div>
    </div>
  )
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [type, setType] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [result, setResult] = useState({ key: '', items: [], error: '' })
  const resultsRef = useRef(null)

  const debouncedKeyword = useDebounced(keyword)
  const debouncedLocation = useDebounced(location)

  const query = useMemo(() => {
    const params = {}
    if (type) params.type = type
    if (categoryId) params.categoryId = categoryId
    if (debouncedKeyword.trim()) params.keyword = debouncedKeyword.trim()
    if (debouncedLocation.trim()) params.location = debouncedLocation.trim()
    return params
  }, [type, categoryId, debouncedKeyword, debouncedLocation])

  const key = JSON.stringify(query)

  useEffect(() => {
    api
      .get('/api/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let ignore = false
    api
      .get('/api/items', { params: query })
      .then(({ data }) => {
        if (!ignore) setResult({ key, items: data, error: '' })
      })
      .catch((err) => {
        if (!ignore) setResult({ key, items: [], error: getErrorMessage(err) })
      })
    return () => {
      ignore = true
    }
  }, [query, key])

  const loading = result.key !== key
  const hasFilters = type || categoryId || keyword || location

  const clearFilters = () => {
    setType('')
    setCategoryId('')
    setKeyword('')
    setLocation('')
  }

  const scrollToResults = (e) => {
    e.preventDefault()
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Lost it on campus? Someone may already have found it.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Search the items students and staff have handed in, or post what you lost so the
              finder can reach you.
            </p>

            <form
              onSubmit={scrollToResults}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-sm focus-within:ring-4 focus-within:ring-found/15"
            >
              <Search className="ml-2 size-5 shrink-0 text-ink-soft" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search for an item, like black wallet"
                aria-label="Search items"
                className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-slate-400"
              />
              <button className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-found">
                Search
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
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
          </div>

          <div className="relative mx-auto hidden h-80 w-full max-w-sm lg:block" aria-hidden="true">
            <SampleTag className="absolute left-0 top-8 -rotate-6" tone="lost" title="Blue water bottle" place="Sports complex" />
            <SampleTag className="absolute right-0 top-0 rotate-3" tone="found" title="Silver house keys" place="Parking area" />
            <SampleTag className="absolute bottom-0 left-12 rotate-1" tone="found" title="Physics notebook" place="Lab 2" />
          </div>
        </div>
      </section>

      <section ref={resultsRef} className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex self-start rounded-xl border border-line bg-white p-1">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                aria-pressed={type === t.value}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  type === t.value ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative lg:w-72">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by place, like Library"
              aria-label="Filter by location"
              className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-found focus:ring-4 focus:ring-found/15"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryId('')}
            aria-pressed={categoryId === ''}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              categoryId === ''
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-ink-soft hover:border-ink hover:text-ink'
            }`}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(categoryId === c.id ? '' : c.id)}
              aria-pressed={categoryId === c.id}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                categoryId === c.id
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-white text-ink-soft hover:border-ink hover:text-ink'
              }`}
            >
              <CategoryIcon name={c.name} className="size-4" />
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-ink-soft" aria-live="polite">
            {loading
              ? 'Searching...'
              : `${result.items.length} ${result.items.length === 1 ? 'item' : 'items'} found`}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-found hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading && Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
          {!loading && result.items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>

        {!loading && result.error && (
          <div className="mt-6 rounded-2xl border border-lost/30 bg-lost-soft px-5 py-4 text-sm text-lost">
            {result.error}
          </div>
        )}

        {!loading && !result.error && result.items.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
            <SearchX className="mx-auto size-10 text-ink-soft" />
            <h2 className="mt-4 font-display text-xl font-bold">
              {hasFilters ? 'No items match these filters' : 'No items have been posted yet'}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-ink-soft">
              {hasFilters
                ? 'Try different words or another place, or clear the filters to see everything.'
                : 'Be the first to post a lost or found item.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-found"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>
    </>
  )
}