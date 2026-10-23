import styles from "./loading.module.css";

export default function WorkspaceLoading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite" aria-label="Carregando área da plataforma">
      <div className={styles.title} />
      <div className={styles.stats}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.panel}>
        <span />
        <span />
        <span />
      </div>
      <span className={styles.srOnly}>Carregando área da plataforma...</span>
    </div>
  );
}
