import { API_URL } from '../api/axios'

export function imageSrc(url) {
  if (!url) return null
  if (url.startsWith('http') || url.startsWith('blob:')) return url
  return `${API_URL}${url}`
}

export function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(`${dateStr}T00:00:00`).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return formatDate(dateStr)
}