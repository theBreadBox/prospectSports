'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Page5() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        <iframe
          src="https://www.prospectsports.xyz/"
          className={styles.iframe}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title="External Website"
        />
        <div className={styles.links}>
          <Link href="/navigate" className={styles.link}>
            Back to Navigation Cube
          </Link>
          <Link href="/" className={styles.link}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 