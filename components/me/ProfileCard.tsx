import styles from "./ProfileCard.module.css";

type ProfileCardProps = {
  name: string;
  email: string;
  savedJobsCount: number;
  savedSearchesCount: number;
};

function getInitials(name: string): string {
  return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProfileCard({ name, email, savedJobsCount, savedSearchesCount }: ProfileCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.avatar} aria-hidden="true">{getInitials(name)}</div>

      <div className={styles.details}>
        <p className={styles.name}>{name}</p>
        <p className={styles.email}>{email}</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statTile}>
          <p className={styles.statValue}>{savedJobsCount}</p>
          <p className={styles.statLabel}>Saved jobs</p>
        </div>
        <div className={styles.statTile}>
          <p className={styles.statValue}>{savedSearchesCount}</p>
          <p className={styles.statLabel}>Saved searches</p>
        </div>
      </div>
    </div>
  );
}