'use client';

import React from 'react';
import Link from 'next/link';
import Cube from '@/components/CubeNav';
import styles from './navigate.module.css';

export default function NavigatePage() {
  return (
    <div className={styles.navigateContainer}>
      <Link href="/" className={styles.homeLink}>
        ←
      </Link>
      
      <Cube />
    </div>
  );
} 