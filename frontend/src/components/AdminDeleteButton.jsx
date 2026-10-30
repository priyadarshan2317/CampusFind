import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import api from '../api/axios'
import { getErrorMessage } from '../utils/errors'

export default function AdminDeleteButton({ id }) {
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const remove = async () => {
    setBusy(true)
    setError('')
    try {
      await api.delete(`/api/items/${id}`)
      navigate('/admin')
    } catch (err) {
      setError(getErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-lost/30 bg-lost-soft/50 p-5">
      <p className="text-sm font-medium">Remove this post from CampusFind</p>
      <p className="mt-1 text-sm text-ink-soft">
        Use this for spam or inappropriate posts. It cannot be undone.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-lost">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold">
        {confirming ? (
          <>
            <button
              onClick={remove}
              disabled={busy}
              className="rounded-lg bg-lost px-3.5 py-2 text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Deleting' : 'Yes, delete it'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg px-3.5 py-2 text-ink-soft transition hover:text-ink"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 rounded-lg border border-lost/40 bg-white px-3.5 py-2 text-lost transition hover:bg-lost-soft"
          >
            <Trash2 className="size-4" />
            Delete post
          </button>
        )}
      </div>
    </div>
  )
}