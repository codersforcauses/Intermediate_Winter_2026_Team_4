import { SavedSearch } from "@/types/me";
import styles from "./SavedSearchCard.module.css";

type SavedSearchCardProps = { search: SavedSearch };

export default function SavedSearchCard({ search }: SavedSearchCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.main}>
        <p className={styles.query}>&ldquo;{search.query}&rdquo;</p>
        <p className={styles.meta}>{search.resultsCount} results &middot; saved {search.createdAgo}</p>
      </div>
      {/* TODO (backend/routing): re-run this search against live listings */}
      <a className={styles.viewButton} href="#">View ↗</a>
    </div>
  );
}