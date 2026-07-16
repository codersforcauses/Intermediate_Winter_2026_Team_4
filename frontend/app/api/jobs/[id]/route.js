import { NextResponse } from 'next/server'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000/api/jobs/'

function formatPosted(postedAt) {
  if (!postedAt) return undefined
  const posted = new Date(postedAt)
  if (Number.isNaN(posted.getTime())) return undefined

  const days = Math.floor((Date.now() - posted.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  return `${days}d ago`
}

// Convert a job_postings row from the Django API into the shape the job detail UI expects.
function toDisplayJob(job) {
  let salary = 'Salary not listed'
  if (job.salary_min && job.salary_max) {
    salary = `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
  } else if (job.salary_min) {
    salary = `From $${job.salary_min.toLocaleString()}`
  }

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    tag: job.category || undefined,
    salary,
    posted: formatPosted(job.posted_at),
    description: job.description,
    url: job.url,
  }
}

export async function GET(request, { params }) {
  const { id } = await params
  const target = `${DJANGO_API_URL}${encodeURIComponent(id)}/`

  try {
    const res = await fetch(target)
    if (res.status === 404) {
      return NextResponse.json({ job: null, error: 'Job not found' }, { status: 404 })
    }
    if (!res.ok) {
      throw new Error(`Django API responded with ${res.status}`)
    }
    const data = await res.json()
    return NextResponse.json({ job: toDisplayJob(data.job) })
  } catch (e) {
    return NextResponse.json({ job: null, error: 'Failed to reach job search backend' }, { status: 502 })
  }
}
