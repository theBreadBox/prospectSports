'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

// Use dynamic import with no SSR to avoid hydration issues with wallet connection
const ReferralTracker = dynamic(
  () => import('../../components/ReferralTracker'),
  { ssr: false }
);

export default function Page3() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        <h1 className={styles.title}>Referral Tracker</h1>
        <p className={styles.description}>
          View your referral statistics and share your unique referral code with friends.
        </p>
        
        <div className={styles.trackerSection}>
          <ReferralTracker />
        </div>
        
        <div className={styles.infoSection}>
          <h2 className={styles.subtitle}>How Referrals Work</h2>
          <ul className={styles.infoList}>
            <li>Each user receives a unique referral code after registration</li>
            <li>Share your referral code with friends to invite them to join</li>
            <li>Each referral code can be used up to 5 times maximum</li>
            <li>Track your referrals and see how many people have joined using your code</li>
          </ul>
        </div>
        
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