"use client";

import { useState } from "react";

// ================================================================
// Mock data
// ================================================================
// FOR BACKEND TEAMMATES:
// Replace these with real fetch() calls when the API is ready.
// Keep the same field names and the components won't need to change.
// ================================================================

const mockUser = {
  name: "Yeona Kim",
  email: "yeonakim@email.com",
};

const mockSavedJobs = [
  { id: "job-001", title: "Senior Python Developer", tag: "Python", company: "Tech Co", location: "Perth", postedAgo: "1d ago", salary: "$130,000" },
  { id: "job-002", title: "Java Backend Engineer", tag: "Java", company: "FinServe", location: "Perth", postedAgo: "3d ago", salary: "$145,000" },
  { id: "job-003", title: "Frontend Developer (React)", tag: "JavaScript", company: "Webly", location: "Perth", postedAgo: "2d ago", salary: "$110,000" },
];

const mockSavedSearches = [
  { id: "search-001", query: "Python developer in Perth", resultsCount: 134, createdAgo: "2d ago" },
  { id: "search-002", query: "Frontend developer remote", resultsCount: 256, createdAgo: "5d ago" },
];

// ================================================================
// Helper: turn "Yeona Kim" into "YK"
// ================================================================
function getInitials(name: string): string {
  return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
}

// ================================================================
// Main page
// ================================================================
export default function MePage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "searches">("jobs");

  return (
    <main className="min-h-screen bg-[#f5f4f1] px-12 py-10 flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a8a]">My profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your saved jobs and searches</p>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-xl p-7 flex items-center gap-5 flex-wrap">
        {/* Avatar */}
        <div className="w-16 h-16 min-w-16 rounded-full bg-[#dce3f7] text-[#1e3a8a] flex items-center justify-content-center justify-center text-lg font-bold">
          {getInitials(mockUser.name)}
        </div>

        {/* Name + email */}
        <div className="flex flex-col gap-1 flex-1">
          <p className="text-lg font-bold text-gray-900">{mockUser.name}</p>
          <p className="text-sm text-gray-500">{mockUser.email}</p>
        </div>

        {/* Stat tiles */}
        <div className="flex gap-3">
          <div className="bg-[#eceae5] rounded-xl px-6 py-4 text-center min-w-[90px]">
            <p className="text-2xl font-bold text-[#1e3a8a]">{mockSavedJobs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Saved jobs</p>
          </div>
          <div className="bg-[#eceae5] rounded-xl px-6 py-4 text-center min-w-[90px]">
            <p className="text-2xl font-bold text-[#1e3a8a]">{mockSavedSearches.length}</p>
            <p className="text-xs text-gray-500 mt-1">Saved searches</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
            ⭐ Saved Jobs ({mockSavedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab("searches")}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px cursor-pointer ${
              activeTab === "searches"
                ? "border-[#1e3a8a] text-gray-900"
                : "border-transparent text-gray-400"
            }`}
          >
            🔖 Saved Searches ({mockSavedSearches.length})
          </button>
        </div>

        {/* Tab content */}
        <div className="flex flex-col gap-3 mt-5">

          {/* Saved Jobs */}
          {activeTab === "jobs" && mockSavedJobs.map((job) => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900">{job.title}</p>
                  <span className="bg-[#dce3f7] text-[#1e3a8a] text-xs font-semibold px-3 py-0.5 rounded-full">
                    {job.tag}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{job.company} · {job.location} · {job.postedAgo}</p>
                <p className="text-sm font-bold text-[#1e3a8a]">{job.salary}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-yellow-500 text-lg">★</span>
                {/* TODO (backend): link to real job listing */}
                <a href="#" className="border border-gray-300 rounded-lg px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50">
                  View ↗
                </a>
              </div>
            </div>
          ))}

          {/* Saved Searches */}
          {activeTab === "searches" && mockSavedSearches.map((search) => (
            <div key={search.id} className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-bold text-gray-900">&ldquo;{search.query}&rdquo;</p>
                <p className="text-sm text-gray-500 mt-1">{search.resultsCount} results · saved {search.createdAgo}</p>
              </div>
              {/* TODO (backend): re-run this search against live listings */}
              <a href="#" className="border border-gray-300 rounded-lg px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50">
                View ↗
              </a>
            </div>
          ))}

        </div>
      </div>

    </main>
  );
}