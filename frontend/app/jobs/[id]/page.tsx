"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";

type JobDetail = {
  id: string;
  title: string;
  company: string;
  location: string;
  tag?: string;
  salary?: string;
  posted?: string;
  description?: string;
  url?: string;
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchJob() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/jobs/${encodeURIComponent(params.id)}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (!cancelled) setJob(data.job || null);
      } catch (e) {
        if (!cancelled) setJob(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchJob();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />

      <main className="ml-[220px] flex-1 p-6">
        <div className="max-w-[980px] mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Job detail</h1>
            <div className="text-sm text-muted">View full job information and apply directly</div>
          </div>

          <Link href="/dashboard" className="text-sm text-muted hover:text-text">
            ← Back to listings
          </Link>

          <div className="mt-4">
            {loading && <div className="text-muted">Loading job…</div>}

            {!loading && notFound && (
              <div className="bg-white border border-line rounded-lg p-8 text-center text-muted">
                This job couldn&apos;t be found. It may no longer be available.
              </div>
            )}

            {!loading && !notFound && job && (() => {
              const isTruncated = job.description?.trim().endsWith("…") ?? false;
              return (
              <div className="bg-white border border-line rounded-lg p-8">
                <h2 className="text-2xl font-bold">{job.title}</h2>
                <div className="flex items-center gap-4 text-muted text-sm mt-2">
                  <span>🏢 {job.company}</span>
                  <span>📍 {job.location}</span>
                  {job.posted && <span>🕐 {job.posted}</span>}
                </div>

                {job.salary && (
                  <div className="text-accent text-xl font-bold mt-4">{job.salary}</div>
                )}

                {job.tag && (
                  <div className="flex gap-2 mt-4">
                    <span className="text-xs px-3 py-1 bg-accent-soft text-accent rounded-full">
                      {job.tag}
                    </span>
                  </div>
                )}

                <hr className="border-line my-6" />

                <div className="text-xs font-semibold text-muted tracking-wide mb-3">
                  ABOUT THE ROLE
                </div>
                <div className="whitespace-pre-line text-[15px] leading-relaxed">
                  {job.description || "No description provided for this role."}
                </div>

                {isTruncated && job.url && (
                  <div className="mt-3 text-sm text-muted">
                    This is a preview from Adzuna.{" "}
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline"
                    >
                      View the full posting ↗
                    </a>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-4 rounded-[10px] bg-accent text-white flex items-center justify-center font-medium"
                    >
                      Apply now ↗
                    </a>
                  )}
                  <button
                    onClick={() => setSaved((s) => !s)}
                    className="h-10 px-4 rounded-[10px] border border-line flex items-center justify-center gap-2"
                  >
                    {saved ? "★" : "☆"} Save job
                  </button>
                </div>
              </div>
              );
            })()}
          </div>

          {!loading && !notFound && job && (
            <div className="text-center text-xs text-muted mt-6">
              Data sourced from Adzuna API{job.posted ? ` · Posted ${job.posted}` : ""}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
