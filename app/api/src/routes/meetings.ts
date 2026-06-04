import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

router.get('/', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : ''

  const filters = []
  if (q) {
    filters.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { body: { contains: q, mode: 'insensitive' as const } },
      ],
    })
  }
  if (tag) {
    filters.push({ tags: { has: tag } })
  }

  const meetings = await prisma.meeting.findMany({
    where: filters.length ? { AND: filters } : undefined,
    orderBy: { meetingDate: 'desc' },
  })
  res.json(meetings)
})

router.get('/:id', async (req, res) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: req.params.id },
  })
  if (!meeting) {
    return res.status(404).json({ error: 'Not found' })
  }
  res.json(meeting)
})

router.post('/', async (req, res) => {
  // TODO: validate input
  const { title, body, meetingDate, tags } = req.body
  const meeting = await prisma.meeting.create({
    data: {
      title,
      body,
      meetingDate: new Date(meetingDate),
      tags: Array.isArray(tags) ? tags : [],
    },
  })
  res.status(201).json(meeting)
})

router.put('/:id', async (req, res) => {
  const { title, body, meetingDate, tags } = req.body
  const meeting = await prisma.meeting.update({
    where: { id: req.params.id },
    data: {
      title,
      body,
      meetingDate: meetingDate ? new Date(meetingDate) : undefined,
      tags: Array.isArray(tags) ? tags : undefined,
    },
  })
  res.json(meeting)
})

router.delete('/:id', async (req, res) => {
  await prisma.meeting.delete({
    where: { id: req.params.id },
  })
  res.status(204).end()
})

export default router
