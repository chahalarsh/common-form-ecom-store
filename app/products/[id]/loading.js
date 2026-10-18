import styles from "../../Shop.module.css";

export default function ProductLoading() {
  return (
    <main className={`${styles.page} ${styles.productPage}`}>
      <div className={styles.container}>
        <div aria-label="Loading product" className={styles.productLayout}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      </div>
    </main>
  );
}
