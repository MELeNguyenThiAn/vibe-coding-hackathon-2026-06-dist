'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { fetchMeetings, formatDate } from '@/lib/api'
import type { Meeting } from '@/lib/types'

function MeetingList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [meetings, setMeetings] = useState<Meeting[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Initialise filters from the URL so a shared link / page reload keeps state.
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeTag, setActiveTag] = useState<string | null>(
    searchParams.get('tag')
  )

  // Keep the URL in sync with the current filters (shareable, survives reload).
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (activeTag) params.set('tag', activeTag)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [query, activeTag, pathname, router])

  useEffect(() => {
    let ignore = false
    const handler = setTimeout(() => {
      fetchMeetings({ q: query, tag: activeTag ?? undefined })
        .then((m) => {
          if (!ignore) {
            setMeetings(m)
            setError(null)
          }
        })
        .catch((e) => {
          if (!ignore) setError(e.message)
        })
    }, 300)
    return () => {
      ignore = true
      clearTimeout(handler)
    }
  }, [query, activeTag])

  // Tag choices for the dropdown: distinct tags from the meetings currently
  // loaded, plus the active tag so it stays selectable even when a search
  // narrows the list down to it.
  const tagOptions = Array.from(
    new Set([
      ...(activeTag ? [activeTag] : []),
      ...(meetings ?? []).flatMap((m) => m.tags),
    ])
  ).sort()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search meetings by title or content…"
          aria-label="Search meetings"
          className="flex-1 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={activeTag ?? ''}
          onChange={(e) => setActiveTag(e.target.value || null)}
          aria-label="Filter by tag"
          className="px-3 py-2 border rounded shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-48"
        >
          <option value="">All tags</option>
          {tagOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {activeTag && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Filtering by tag:</span>
          <button
            onClick={() => setActiveTag(null)}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full hover:bg-blue-200"
          >
            {activeTag}
            <span aria-hidden>✕</span>
            <span className="sr-only">Clear tag filter</span>
          </button>
        </div>
      )}

      {error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : !meetings ? (
        <div className="text-gray-500">Loading...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {query || activeTag
            ? 'No meetings match the current filters.'
            : 'No meetings yet. Create one to get started.'}
        </div>
      ) : (
        <div className="bg-white rounded shadow divide-y">
          {meetings.map((m) => (
            <div key={m.id} className="px-4 py-3 hover:bg-gray-50">
              <Link
                href={`/meetings/${m.id}`}
                className="flex items-start justify-between gap-4"
              >
                <span className="font-medium truncate min-w-0" title={m.title}>
                  {m.title}
                </span>
                <span className="text-sm text-gray-500 shrink-0 whitespace-nowrap">
                  {formatDate(m.meetingDate)}
                </span>
              </Link>
              {m.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {m.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTag(t)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  // useSearchParams() requires a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
      <MeetingList />
    </Suspense>
  )
}
