export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="relative rounded-3xl border border-line bg-white p-8 pt-12 shadow-xl shadow-ink/5">
        <span
          className="absolute left-1/2 top-4 size-4 -translate-x-1/2 rounded-full border-2 border-line bg-paper"
          aria-hidden="true"
        />
        <h1 className="font-display text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-ink-soft">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-5 text-center text-sm text-ink-soft">{footer}</p>
    </div>
  )
}