export default function Field({ label, icon: Icon, hint, right, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <span className="relative block">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
        )}
        <input
          {...props}
          className={`w-full rounded-xl border border-line bg-white py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-found focus:ring-4 focus:ring-found/15 ${
            Icon ? 'pl-10' : 'pl-3'
          } ${right ? 'pr-11' : 'pr-3'}`}
        />
        {right}
      </span>
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  )
}