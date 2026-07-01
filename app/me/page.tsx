import ProfileCard from "@/components/me/ProfileCard";
import SavedTabs from "@/components/me/SavedTabs";
import { getMockUserProfile, getMockSavedJobs, getMockSavedSearches } from "@/lib/mockData";
import styles from "./me.module.css";

// This page only renders the CONTENT area (title, profile card, tabs).
// The sidebar nav is assumed to live in a shared layout owned separately.
export default function MePage() {
  const profile = getMockUserProfile();
  const savedJobs = getMockSavedJobs();
  const savedSearches = getMockSavedSearches();

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>My profile</h1>
      <p className={styles.subtitle}>Manage your saved jobs and searches</p>

      <ProfileCard
        name={profile.name}
        email={profile.email}
        savedJobsCount={savedJobs.length}
        savedSearchesCount={savedSearches.length}
      />

      <SavedTabs jobs={savedJobs} searches={savedSearches} />
    </main>
  );
}