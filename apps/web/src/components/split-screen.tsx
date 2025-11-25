"use client";

import Link from "next/link";
import styles from "./split-screen.module.css";

export function SplitScreen() {
    return (
        <div className={styles.container}>
            <Link 
              href="/branch" 
              className={styles.panel} 
              data-side="left"
              onClick={(e) => {
                e.preventDefault();
                alert('Раздел находится в разработке 🛠️');
              }}
            >
                <div className={styles.background} />
                <div className={styles.overlay} />
                <div className={styles.content}>
                    <span className={styles.kicker}>Engineering</span>
                    <h2 className={styles.title}>Dave & Branch</h2>
                    <span className={styles.cta}>Explore System</span>
                </div>
            </Link>

            <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <div className={styles.dividerLogo}>OI</div>
                <div className={styles.dividerLine} />
            </div>

            <Link href="/music" className={styles.panel} data-side="right">
                <div className={styles.background} />
                <div className={styles.overlay} />
                <div className={styles.musicalNotes}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
                <div className={styles.content}>
                    <span className={styles.kicker}>Art & Sound</span>
                    <h2 className={styles.title}>Music Translation</h2>
                    <span className={styles.cta}>Experience Flow</span>
                </div>
            </Link>
        </div>
    );
}
