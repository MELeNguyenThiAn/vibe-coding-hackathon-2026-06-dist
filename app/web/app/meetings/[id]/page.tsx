'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchMeeting, deleteMeeting, formatDate } from '@/lib/api'
import type { Meeting } from '@/lib/types'

export default function MeetingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchMeeting(id)
      .then(setMeeting)
      .catch((e) => setError(e.message))
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteMeeting(id)
      router.push('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete meeting')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  if (error) return <div className="text-red-600">Error: {error}</div>
  if (!meeting) return <div>Loading...</div>

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{meeting.title}</h1>
        <div className="flex gap-2">
          <Link
            href={`/meetings/${id}/edit`}
            className="px-3 py-1.5 border rounded hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={() => setConfirmingDelete(true)}
            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="mb-6 space-y-2">
        <div className="text-sm text-gray-500">
          {formatDate(meeting.meetingDate)}
        </div>
        {meeting.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meeting.tags.map((t) => (
              <span
                key={t}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="whitespace-pre-wrap">{meeting.body}</div>

      {confirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          onClick={() => !deleting && setConfirmingDelete(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="text-lg font-semibold mb-2">
              Delete this meeting?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              &ldquo;{meeting.title}&rdquo; will be permanently deleted. This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="px-3 py-1.5 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
