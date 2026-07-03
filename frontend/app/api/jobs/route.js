import { NextResponse } from 'next/server'

const sampleJobs = [
  { id: '1', title: 'Senior Python Developer', company: 'Tech Co', location: 'Perth', tag: 'Python', salary: '$130,000', posted: '1d ago' },
  { id: '2', title: 'Java Backend Engineer', company: 'FinServe', location: 'Perth', tag: 'Java', salary: '$145,000', posted: '3d ago' },
  { id: '3', title: 'Frontend Developer (React)', company: 'Webly', location: 'Perth', tag: 'JavaScript', salary: '$110,000', posted: '2d ago' },
  { id: '4', title: 'Data Engineer (Python)', company: 'DataWorks', location: 'Busselton', tag: 'Python', salary: 'Salary not listed', posted: '5d ago' },
  { id: '5', title: 'Full Stack Developer', company: 'Coastal Apps', location: 'Margaret River', tag: 'JavaScript', salary: '$120,000', posted: '8d ago' },
  { id: '6', title: 'Junior Java Developer', company: 'Enterprise WA', location: 'Perth', tag: 'Java', salary: '$85,000', posted: '6d ago' },
  { id: '7', title: 'Python Automation Engineer', company: 'MineTech', location: 'Perth', tag: 'Python', salary: '$135,000', posted: '4d ago' }
]

export function GET(request) {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').trim().toLowerCase()
  const location = (url.searchParams.get('location') || '').trim().toLowerCase()

  const filtered = sampleJobs.filter((job) => {
    let matchesQ = true
    if (q) {
      const hay = `${job.title} ${job.company} ${job.tag || ''}`.toLowerCase()
      matchesQ = hay.includes(q)
    }

    let matchesLocation = true
    if (location) {
      matchesLocation = job.location.toLowerCase().includes(location)
    }

    return matchesQ && matchesLocation
  })

  return NextResponse.json({ jobs: filtered })
}
