"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  tag?: string;
  salary?: string;
  posted?: string;
};

export default function MarketPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  async function fetchJobs(q?: string, loc?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (loc) params.set('location', loc);
      const url = `/api/jobs${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (e) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    fetchJobs();
  }, []);

  function toggleFav(id: string) {
    setFavs((s) => ({ ...s, [id]: !s[id] }));
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar (kept similar to login page so layout looks consistent) */}
      <aside className="w-[220px] min-h-screen bg-surface border-r border-line flex flex-col fixed top-0 left-0 z-30">
        <div className="px-[18px] py-5 border-b border-line">
          <div className="font-bold text-[17px] text-accent tracking-tight">CFC Project</div>
          <div className="text-[11px] text-muted mt-[1px]">Job market insights</div>
        </div>
        <nav className="flex-1 p-2">
          <Link href="/dashboard" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text bg-surface-2 text-text">
            <span className="text-base w-5 text-center">📈</span> Job listings
          </Link>
          <Link href="/" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text">
            <span className="text-base w-5 text-center">🔍</span> Market overview
          </Link>
          <Link href="/me" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text">
            <span className="text-base w-5 text-center">👤</span> Me
          </Link>
        </nav>
        <div className="p-2 border-t border-line">
          <Link href="/login" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm bg-accent-soft text-accent font-medium">
            <span className="text-base w-5 text-center">→</span> Login / Register
          </Link>
          <button className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text w-full text-left">
            <span className="text-base w-5 text-center">↩</span> Log off
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[220px] flex-1 p-6">
        <div className="max-w-[980px] mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Job listings</h1>
            <div className="text-sm text-muted">Search and explore IT job opportunities across Western Australia</div>
          </div>

          <div className="flex gap-4 mb-6">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-10 rounded-[10px] border border-line px-4 bg-surface-2"
              placeholder="Search keyword — Python, Java, React..."
            />
            <input
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="h-10 rounded-[10px] border border-line bg-white px-3"
              placeholder="Location (e.g. Perth)"
            />
            <button
              onClick={() => fetchJobs(searchQuery, locationFilter)}
              className="h-10 px-4 rounded-[10px] bg-accent text-white"
            >
              Search
            </button>
          </div>

          <div className="space-y-4">
            {loading && <div className="text-muted">Loading jobs…</div>}
            {!loading && jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between bg-white border border-line rounded-lg p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{job.title}</div>
                    {job.tag && <div className="text-xs px-2 py-1 bg-surface-2 rounded text-muted">{job.tag}</div>}
                  </div>
                  <div className="text-sm text-muted mt-1">{job.company} · {job.location} · <span className="text-[13px]">{job.posted}</span></div>
                  <div className="text-accent font-medium mt-2">{job.salary}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => toggleFav(job.id)} className="text-lg text-muted">
                    {favs[job.id] ? "★" : "☆"}
                  </button>
                  <Link href="#" className="text-sm py-1 px-3 border border-line rounded-md">View ↗</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
