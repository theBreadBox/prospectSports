'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Page1() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        
        <p className={styles.description}>
          This is a placeholder for Page 1 content. You would replace this with actual content for your application.
        </p>
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