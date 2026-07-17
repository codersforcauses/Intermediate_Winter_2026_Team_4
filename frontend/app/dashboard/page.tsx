"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  tag?: string;
  salary?: string;
  posted?: string;
};

// Builds a compact page list like [1, "…", 4, 5, 6, "…", 20] around the current page.
function getPageNumbers(current: number, total: number): (number | string)[] {
  const delta = 1;
  const pages: (number | string)[] = [];
  let last: number | undefined;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      if (last !== undefined && i - last > 1) {
        pages.push("…");
      }
      pages.push(i);
      last = i;
    }
  }

  return pages;
}

export default function MarketPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  async function fetchJobs(q?: string, loc?: string, pageNum: number = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (loc) params.set('location', loc);
      if (pageNum > 1) params.set('page', String(pageNum));
      const url = `/api/jobs${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setJobs(data.jobs || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      console.log("[Frontend Fetch URL]:", url);
    } catch (e) {
      setJobs([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    fetchJobs();
  }, []);

  function goToPage(pageNum: number) {
    if (pageNum < 1 || pageNum > totalPages || pageNum === page) return;
    fetchJobs(searchQuery, locationFilter, pageNum);
  }

  function toggleFav(id: string) {
    setFavs((s) => ({ ...s, [id]: !s[id] }));
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />

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
              onClick={() => fetchJobs(searchQuery, locationFilter, 1)}
              className="h-10 px-4 rounded-[10px] bg-accent text-white"
            >
              Search
            </button>
          </div>

          {!loading && (
            <div className="text-sm text-muted mb-4 text-right">
              {totalCount.toLocaleString()} {totalCount === 1 ? "job" : "jobs"}
            </div>
          )}

          <div className="space-y-4">
            {loading && <div className="text-muted">Loading jobs…</div>}
            {!loading && jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${encodeURIComponent(job.id)}`}
                className="flex items-center justify-between bg-white border border-line rounded-lg p-4 hover:border-accent transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{job.title}</div>
                    {job.tag && <div className="text-xs px-2 py-1 bg-surface-2 rounded text-muted">{job.tag}</div>}
                  </div>
                  <div className="text-sm text-muted mt-1">{job.company} · {job.location} · <span className="text-[13px]">{job.posted}</span></div>
                  <div className="text-accent font-medium mt-2">{job.salary}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFav(job.id);
                    }}
                    className="text-lg text-muted"
                  >
                    {favs[job.id] ? "★" : "☆"}
                  </button>
                  <span className="text-sm py-1 px-3 border border-line rounded-md">View ↗</span>
                </div>
              </Link>
            ))}
          </div>

          {!loading && jobs.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="h-9 px-3 rounded-[10px] border border-line disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>

              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-muted">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`h-9 min-w-9 px-3 rounded-[10px] border ${
                      p === page
                        ? "bg-accent text-white border-accent"
                        : "border-line hover:bg-surface-2"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="h-9 px-3 rounded-[10px] border border-line disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
