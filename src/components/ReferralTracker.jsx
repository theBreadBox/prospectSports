'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import styles from './ReferralTracker.module.css';

export default function ReferralTracker() {
  const { address, status } = useAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referralStats, setReferralStats] = useState(null);
  const [userReferralCode, setUserReferralCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!address || status !== 'connected') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/referrals?wallet=${address}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('You are not registered yet. Register on the homepage to get your referral code.');
          } else {
            const data = await response.json();
            setError(data.error || 'Failed to load referral data');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setReferralStats(data.stats);
        setUserReferralCode(data.stats.referral_code);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching referral data:', err);
        setError('Failed to load referral data');
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [address, status]);

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${userReferralCode}`;
    navigator.clipboard.writeText(referralLink);
    setMessage('Referral link copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!address || status !== 'connected') {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Referral Stats</h2>
        <p className={styles.message}>Connect your wallet to see your referral statistics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Referral Stats</h2>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Referral Stats</h2>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Referral Statistics</h2>
      
      {referralStats && (
        <div className={styles.statsContainer}>
          <div className={styles.codeContainer}>
            <p className={styles.label}>Your Referral Code:</p>
            <p className={styles.code}>{userReferralCode}</p>
            <button 
              className={styles.copyButton}
              onClick={copyReferralLink}
            >
              Copy Referral Link
            </button>
            {message && <p className={styles.copyMessage}>{message}</p>}
          </div>
          
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>People Referred:</span>
              <span className={styles.statValue}>{referralStats.total_referred || 0}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Remaining Invites:</span>
              <span className={styles.statValue}>{referralStats.remaining_uses || 5}</span>
            </div>
          </div>
          
          {referralStats.total_referred > 0 && (
            <div className={styles.progressContainer}>
              <div className={styles.progressLabel}>
                <span>Referral Progress</span>
                <span>{referralStats.total_referred}/5</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${Math.min(100, (referralStats.total_referred / 5) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 