import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'
import CategoryIcon from './CategoryIcon'
import { imageSrc, timeAgo } from '../utils/format'

export default function ItemCard({ item }) {
  const found = item.type === 'FOUND'
  const src = imageSrc(item.imageUrl)

  return (
    <Link
      to={`/items/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10"
    >
      <div className={`h-1.5 ${found ? 'bg-found' : 'bg-lost'}`} />

      <div className="relative aspect-[4/3] overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={item.title}
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`grid size-full place-items-center ${
              found ? 'bg-found-soft text-found' : 'bg-lost-soft text-lost'
            }`}
          >
            <CategoryIcon name={item.categoryName} className="size-14 opacity-70" />
          </div>
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm ${
            found ? 'bg-found' : 'bg-lost'
          }`}
        >
          {found ? 'Found' : 'Lost'}
        </span>
        <span
          className="absolute right-3 top-3 size-4 rounded-full border-2 border-white/90 bg-paper shadow-inner"
          aria-hidden="true"
        />
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-bold leading-snug">{item.title}</h3>

        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
          <li className="flex items-center gap-2">
            <CategoryIcon name={item.categoryName} className="size-4 shrink-0" />
            {item.categoryName}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            {item.location}
          </li>
          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" />
            {timeAgo(item.dateReported)}
          </li>
        </ul>
      </div>
    </Link>
  )
}