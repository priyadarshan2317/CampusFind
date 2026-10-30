import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

export default function ImageUpload({ src, onPick, onClear }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const pick = (file) => {
    if (!file) return
    if (!ALLOWED.includes(file.type)) {
      setError('Use a JPG, PNG or WEBP image.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('That image is larger than 5 MB. Choose a smaller one.')
      return
    }
    setError('')
    onPick(file)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {src ? (
        <div className="overflow-hidden rounded-2xl border border-line">
          <img src={src} alt="Selected item" className="aspect-[4/3] w-full object-cover" />
          <div className="flex gap-2 border-t border-line bg-paper p-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium transition hover:border-ink"
            >
              Change photo
            </button>
            <button
              type="button"
              onClick={() => {
                setError('')
                onClear()
              }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-lost transition hover:bg-lost-soft"
            >
              Remove photo
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            pick(e.dataTransfer.files?.[0])
          }}
          className={`flex w-full flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? 'border-found bg-found-soft'
              : 'border-line bg-white hover:border-found hover:bg-found-soft/40'
          }`}
        >
          <ImagePlus className="size-9 text-ink-soft" />
          <span className="mt-3 font-medium">Drop a photo here, or click to browse</span>
          <span className="mt-1 text-sm text-ink-soft">JPG, PNG or WEBP, up to 5 MB</span>
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-lost">
          {error}
        </p>
      )}
    </div>
  )
}