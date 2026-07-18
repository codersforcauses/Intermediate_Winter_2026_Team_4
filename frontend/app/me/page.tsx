"use client";

import { useState, useEffect } from "react";

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
  const [activeTab, setActiveTab] = useState<"jobs" | "searches">("jobs");
  const [favouriteJobs, setFavouriteJobs] = useState<FavouriteJob[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded user for now — replace with real auth later
  const mockUser = { name: "Yeona Kim", email: "yeonakim@email.com" };

  // Fetch data from Django API when the page loads
  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsRes, searchesRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/me/favourites/"),
          fetch("http://127.0.0.1:8000/api/me/searches/"),
        ]);

        if (!jobsRes.ok || !searchesRes.ok) {
          throw new Error("Failed to fetch data from server");
        }

        const jobsData = await jobsRes.json();
        const searchesData = await searchesRes.json();

        setFavouriteJobs(jobsData.favourite_jobs);
        setSavedSearches(searchesData.saved_searches);
      } catch (err) {
        setError("Could not load your data. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ── Delete a favourite job ──────────────────────────────────────
  async function handleDeleteJob(id: number) {
    try {
      await fetch(`http://127.0.0.1:8000/api/me/favourites/${id}/`, {
        method: "DELETE",
      });
      // Remove from UI immediately after deleting
      setFavouriteJobs((prev) =>
        prev.filter((job) => job.favourite_jobs_id !== id)
      );
    } catch {
      alert("Failed to remove job. Please try again.");
    }
  }

  // ── Delete a saved search ───────────────────────────────────────
  async function handleDeleteSearch(id: number) {
    try {
      await fetch(`http://127.0.0.1:8000/api/me/searches/${id}/`, {
        method: "DELETE",
      });
      setSavedSearches((prev) =>
        prev.filter((s) => s.saved_searches_id !== id)
      );
    } catch {
      alert("Failed to remove search. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f4f1] px-12 py-10 flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a8a]">My profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your saved jobs and searches
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-xl p-7 flex items-center gap-5 flex-wrap">
        <div className="w-16 h-16 min-w-16 rounded-full bg-[#dce3f7] text-[#1e3a8a] flex items-center justify-center text-lg font-bold">
          {getInitials(mockUser.name)}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="text-lg font-bold text-gray-900">{mockUser.name}</p>
          <p className="text-sm text-gray-500">{mockUser.email}</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#eceae5] rounded-xl px-6 py-4 text-center min-w-[90px]">
            <p className="text-2xl font-bold text-[#1e3a8a]">
              {favouriteJobs.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Saved jobs</p>
          </div>
          <div className="bg-[#eceae5] rounded-xl px-6 py-4 text-center min-w-[90px]">
            <p className="text-2xl font-bold text-[#1e3a8a]">
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

      {/* Tabs */}
      {!loading && !error && (
        <div>
          <div className="flex gap-7 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`pb-3 text-sm font-semibold border-b-2 -mb-px cursor-pointer ${
                activeTab === "jobs"
                  ? "border-[#1e3a8a] text-gray-900"
                  : "border-transparent text-gray-400"
              }`}
            >
              ⭐ Saved Jobs ({favouriteJobs.length})
            </button>
            <button
              onClick={() => setActiveTab("searches")}
              className={`pb-3 text-sm font-semibold border-b-2 -mb-px cursor-pointer ${
                activeTab === "searches"
                  ? "border-[#1e3a8a] text-gray-900"
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
                      className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex items-start justify-between gap-4 flex-wrap"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-500">
                          {job.company} · {job.location}
                        </p>
                        <p className="text-sm font-bold text-[#1e3a8a]">
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
                      className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
                    >
                      <div>
                        <p className="font-bold text-gray-900">
                          &ldquo;{search.keyword}&rdquo;
                          {search.location && ` in ${search.location}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {search.alert_enabled ? "🔔 Alerts on" : "🔕 Alerts off"}
                        </p>
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
  );
}