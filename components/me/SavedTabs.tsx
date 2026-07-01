"use client"; // needed because this component uses useState for tab switching

import { useState } from "react";
import { SavedJob, SavedSearch } from "@/types/me";
import SavedJobCard from "./SavedJobCard";
import SavedSearchCard from "./SavedSearchCard";
import styles from "./SavedTabs.module.css";

type SavedTabsProps = {
  jobs: SavedJob[];
  searches: SavedSearch[];
};

type TabKey = "jobs" | "searches";

export default function SavedTabs({ jobs, searches }: SavedTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("jobs");

  return (
    <div>
      <div className={styles.tabList} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "jobs"}
          className={`${styles.tabButton} ${activeTab === "jobs" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          ⭐ Saved Jobs ({jobs.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "searches"}
          className={`${styles.tabButton} ${activeTab === "searches" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("searches")}
        >
          🔖 Saved Searches ({searches.length})
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "jobs" ? (
          <div className={styles.list}>
            {jobs.map((job) => <SavedJobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <div className={styles.list}>
            {searches.map((search) => <SavedSearchCard key={search.id} search={search} />)}
          </div>
        )}
      </div>
    </div>
  );
}