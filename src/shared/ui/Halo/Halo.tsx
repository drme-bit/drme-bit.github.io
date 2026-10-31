import styles from './Halo.module.scss';

/*  Halo — decorative rotating rings used behind the logo mark.  */

export function Halo() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle className={styles.track} cx="100" cy="100" r="97" />
      <circle className={styles.arc} cx="100" cy="100" r="84" />
      <circle className={styles['arc-rev']} cx="100" cy="100" r="71" />
    </svg>
  );
}
