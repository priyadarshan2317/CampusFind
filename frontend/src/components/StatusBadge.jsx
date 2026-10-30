const STYLES = {
  PENDING: { label: 'In review', className: 'bg-tag/40 text-ink' },
  APPROVED: { label: 'Live', className: 'bg-found-soft text-found' },
  CLAIMED: { label: 'Claimed', className: 'bg-slate-200 text-ink-soft' },
  REJECTED: { label: 'Not approved', className: 'bg-lost-soft text-lost' },
}

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.PENDING
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.className}`}
    >
      {style.label}
    </span>
  )
}