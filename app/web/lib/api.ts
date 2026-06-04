import type { Meeting } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function fetchMeetings(
  filters: { q?: string; tag?: string } = {}
): Promise<Meeting[]> {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.tag) params.set('tag', filters.tag)
  const qs = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${API_URL}/api/meetings${qs}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch meetings')
  return res.json()
}

// Parse a comma-separated tag input into a clean list: trims whitespace,
// drops empties, and removes duplicates (preserving the order entered).
export function parseTags(input: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of input.split(',')) {
    const tag = raw.trim()
    if (tag && !seen.has(tag)) {
      seen.add(tag)
      result.push(tag)
    }
  }
  return result
}

export async function fetchMeeting(id: string): Promise<Meeting> {
  const res = await fetch(`${API_URL}/api/meetings/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch meeting')
  return res.json()
}

export async function createMeeting(data: {
  title: string
  body: string
  meetingDate: string
  tags: string[]
}): Promise<Meeting> {
  const res = await fetch(`${API_URL}/api/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create meeting')
  return res.json()
}

export async function updateMeeting(
  id: string,
  data: { title: string; body: string; meetingDate: string; tags: string[] }
): Promise<Meeting> {
  const res = await fetch(`${API_URL}/api/meetings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update meeting')
  return res.json()
}

export async function deleteMeeting(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/meetings/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete meeting')
}

// Meetings are displayed in JST (Asia/Tokyo), fixed regardless of the
// viewer's local timezone. Using toISOString() here showed the UTC date,
// which shifted early-morning JST meetings (00:00–08:59 JST) back by a day.
const JST_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatDate(isoString: string): string {
  return JST_DATE_FORMATTER.format(new Date(isoString))
}
