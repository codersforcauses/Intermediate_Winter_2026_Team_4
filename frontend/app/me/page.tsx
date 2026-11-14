"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

// ================================================================
// Types — describe the shape of data coming from our Django API
// ================================================================
type FavouriteJob = {
  favourite_jobs_id: number;
  adzuna_id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  redirect_url: string;
  saved_at: string;
};

type SavedSearch = {
  saved_searches_id: number;
  keyword: string;
  location: string;
  alert_enabled: boolean;
  created_at: string;
};

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <main className="ml-[220px] flex-1 px-12 py-10 flex flex-col gap-6 max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  );
}

// ================================================================
// Helper: turn "Yeona Kim" into "YK"
// ================================================================
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ================================================================
// Helper: format salary range for display
// ================================================================
function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Salary not listed";
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  return `Up to $${max!.toLocaleString()}`;
}

// ================================================================
// Main page
// ================================================================
export default function MePage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"jobs" | "searches">("jobs");
  const [favouriteJobs, setFavouriteJobs] = useState<FavouriteJob[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load this user's saved jobs and searches once we know who is signed in.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([
      api<{ favourite_jobs: FavouriteJob[] }>("me/favourites"),
      api<{ saved_searches: SavedSearch[] }>("me/searches"),
    ])
      .then(([jobsData, searchesData]) => {
        if (cancelled) return;
        setFavouriteJobs(jobsData.favourite_jobs);
        setSavedSearches(searchesData.saved_searches);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your data. Is the backend running?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Delete a favourite job ──────────────────────────────────────
  async function handleDeleteJob(id: number) {
    setActionError(null);
    try {
      await api(`me/favourites/${id}`, { method: "DELETE" });
      setFavouriteJobs((prev) => prev.filter((job) => job.favourite_jobs_id !== id));
    } catch {
      setActionError("Failed to remove job. Please try again.");
    }
  }

  // ── Delete a saved search ───────────────────────────────────────
  async function handleDeleteSearch(id: number) {
    setActionError(null);
    try {
      await api(`me/searches/${id}`, { method: "DELETE" });
      setSavedSearches((prev) => prev.filter((s) => s.saved_searches_id !== id));
    } catch {
      setActionError("Failed to remove search. Please try again.");
    }
  }

  // ── Turn alerts on/off for a saved search ───────────────────────
  async function handleToggleAlert(search: SavedSearch) {
    setActionError(null);
    try {
      const data = await api<{ saved_search: SavedSearch }>(`me/searches/${search.saved_searches_id}`, {
        method: "PATCH",
        body: { alert_enabled: !search.alert_enabled },
      });
      setSavedSearches((prev) =>
        prev.map((s) => (s.saved_searches_id === search.saved_searches_id ? data.saved_search : s))
      );
    } catch {
      setActionError("Failed to update alerts. Please try again.");
    }
  }

  if (authLoading) {
    return (
      <PageShell>
        <p className="text-sm text-gray-500">Loading…</p>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div className="bg-white border border-line rounded-xl p-7">
          <h1 className="text-2xl font-bold text-accent">My profile</h1>
          <p className="text-sm text-gray-500 mt-2">
            Sign in to see your saved jobs and searches.
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 h-10 leading-10 px-4 rounded-[10px] bg-accent text-white text-sm font-medium"
          >
            Sign in / Create account
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex">
    <Sidebar />
    <main className="ml-[220px] flex-1 px-12 py-10 flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-accent">My profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your saved jobs and searches
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-line rounded-xl p-7 flex items-center gap-5 flex-wrap">
        <div className="w-16 h-16 min-w-16 rounded-full bg-accent-soft text-accent flex items-center justify-center text-lg font-bold">
          {getInitials(user.name)}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="text-lg font-bold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-2 rounded-xl px-6 py-4 text-center min-w-[90px]">
            <p className="text-2xl font-bold text-accent">
              {favouriteJobs.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Saved jobs</p>
          </div>
          <div className="bg-surface-2 rounded-xl px-6 py-4 text-center min-w-[90px]">
            <p className="text-2xl font-bold text-accent">
              {savedSearches.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Saved searches</p>
          </div>
        </div>
      </div>

      {/* Loading / error states */}
      {loading && (
        <p className="text-sm text-gray-500">Loading your data...</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {actionError && (
        <p className="text-sm text-red-500">{actionError}</p>
      )}

      {/* Tabs */}
      {!loading && !error && (
        <div>
          <div className="flex gap-7 border-b border-line">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`pb-3 text-sm font-semibold border-b-2 -mb-px cursor-pointer ${
                activeTab === "jobs"
                  ? "border-accent text-gray-900"
                  : "border-transparent text-gray-400"
              }`}
            >
              ⭐ Saved Jobs ({favouriteJobs.length})
            </button>
            <button
              onClick={() => setActiveTab("searches")}
              className={`pb-3 text-sm font-semibold border-b-2 -mb-px cursor-pointer ${
                activeTab === "searches"
                  ? "border-accent text-gray-900"
                  : "border-transparent text-gray-400"
              }`}
            >
              🔖 Saved Searches ({savedSearches.length})
            </button>
          </div>

          <div className="flex flex-col gap-3 mt-5">

            {/* Saved Jobs tab */}
            {activeTab === "jobs" && (
              <>
                {favouriteJobs.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No saved jobs yet. Search for a job and save it to see it here.
                  </p>
                ) : (
                  favouriteJobs.map((job) => (
                    <div
                      key={job.favourite_jobs_id}
                      className="bg-white border border-line rounded-xl px-6 py-5 flex items-start justify-between gap-4 flex-wrap"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-500">
                          {job.company} · {job.location}
                        </p>
                        <p className="text-sm font-bold text-accent">
                          {formatSalary(job.salary_min, job.salary_max)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <a
                          href={job.redirect_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-gray-300 rounded-lg px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          View ↗
                        </a>
                        <button
                          onClick={() => handleDeleteJob(job.favourite_jobs_id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Saved Searches tab */}
            {activeTab === "searches" && (
              <>
                {savedSearches.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No saved searches yet. Run a search and save it to see it here.
                  </p>
                ) : (
                  savedSearches.map((search) => (
                    <div
                      key={search.saved_searches_id}
                      className="bg-white border border-line rounded-xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
                    >
                      <div>
                        <p className="font-bold text-gray-900">
                          &ldquo;{search.keyword}&rdquo;
                          {search.location && ` in ${search.location}`}
                        </p>
                        <button
                          onClick={() => handleToggleAlert(search)}
                          className="text-sm text-gray-500 mt-1 hover:text-gray-800"
                        >
                          {search.alert_enabled ? "🔔 Alerts on" : "🔕 Alerts off"}
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteSearch(search.saved_searches_id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

          </div>
        </div>
      )}
    </main>
    </div>
  );
}
