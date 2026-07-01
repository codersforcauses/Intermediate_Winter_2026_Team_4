import { SavedJob } from "@/types/me";
import styles from "./SavedJobCard.module.css";

type SavedJobCardProps = { job: SavedJob };

export default function SavedJobCard({ job }: SavedJobCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.main}>
        <div className={styles.titleRow}>
          <p className={styles.title}>{job.title}</p>
          <span className={styles.tag}>{job.tag}</span>
        </div>
        <p className={styles.meta}>{job.company} &middot; {job.location} &middot; {job.postedAgo}</p>
        <p className={styles.salary}>{job.salary}</p>
      </div>

      <div className={styles.actions}>
        {/* TODO (backend): wire this up to actually unsave the job */}
        <span className={styles.star} aria-label="Saved">★</span>
        {/* TODO (backend/routing): link to the real job listing page */}
        <a className={styles.viewButton} href="#">View ↗</a>
      </div>
    </div>
  );
}