import { NextResponse } from 'next/server'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000/api/jobs/'

// Convert a job_postings row from the Django API into the shape the dashboard UI expects.
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
    url: job.url,
  }
}

function formatPosted(postedAt) {
  if (!postedAt) return undefined
  const posted = new Date(postedAt)
  if (Number.isNaN(posted.getTime())) return undefined

  const days = Math.floor((Date.now() - posted.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  return `${days}d ago`
}

export async function GET(request) {
  const url = new URL(request.url)
  const params = new URLSearchParams()
  const q = url.searchParams.get('q')
  const location = url.searchParams.get('location')
  const page = url.searchParams.get('page')
  if (q) params.set('q', q)
  if (location) params.set('location', location)
  if (page) params.set('page', page)
    console.log("[Backend Fetch URL]:", url);

  const target = `${DJANGO_API_URL}${params.toString() ? `?${params.toString()}` : ''}`

  try {
    const res = await fetch(target)
    if (!res.ok) {
      throw new Error(`Django API responded with ${res.status}`)
    }
    const data = await res.json()
    return NextResponse.json({
      jobs: (data.jobs || []).map(toDisplayJob),
      page: data.page || 1,
      totalPages: data.total_pages || 1,
      totalCount: data.total_count || 0,
    })
  } catch (e) {
    return NextResponse.json({ jobs: [], page: 1, totalPages: 1, totalCount: 0, error: 'Failed to reach job search backend' }, { status: 502 })
  }
}
