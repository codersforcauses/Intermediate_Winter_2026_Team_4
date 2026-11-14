"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth";

// A job as the UI holds it (see the /api/jobs route handlers).
export type SavableJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  url?: string;
};

type FavouriteRow = { favourite_jobs_id: number; adzuna_id: string };

/**
 * Tracks which jobs the signed-in user has saved and toggles them.
 * `toggle` resolves to "login" when nobody is signed in, so the caller can
 * send the user to the login page.
 */
export function useFavourites() {
  const { user } = useAuth();
  // adzuna_id -> favourite_jobs_id
  const [saved, setSaved] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api<{ favourite_jobs: FavouriteRow[] }>("me/favourites")
      .then((data) => {
        if (cancelled) return;
        setSaved(
          Object.fromEntries(data.favourite_jobs.map((f) => [f.adzuna_id, f.favourite_jobs_id]))
        );
      })
      .catch(() => {
        // Stars simply show as unsaved if the list can't be loaded.
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isSaved = useCallback((id: string) => Boolean(user) && id in saved, [user, saved]);

  const toggle = useCallback(
    async (job: SavableJob): Promise<"login" | "saved" | "removed"> => {
      if (!user) return "login";

      const existing = saved[job.id];
      if (existing !== undefined) {
        await api(`me/favourites/${existing}`, { method: "DELETE" });
        setSaved((prev) => {
          const next = { ...prev };
          delete next[job.id];
          return next;
        });
        return "removed";
      }

      const data = await api<{ favourite_job: FavouriteRow }>("me/favourites", {
        method: "POST",
        body: {
          adzuna_id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary_min: job.salaryMin ?? null,
          salary_max: job.salaryMax ?? null,
          redirect_url: job.url ?? "",
        },
      });
      setSaved((prev) => ({ ...prev, [job.id]: data.favourite_job.favourite_jobs_id }));
      return "saved";
    },
    [user, saved]
  );

  return { isSaved, toggle };
}
