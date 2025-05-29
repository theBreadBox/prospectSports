"use client";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export default function WalletStatusCheck() {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkWalletStatus = async () => {
      if (!address || !isConnected) {
        setError('');
        return;
      }

      try {
        const response = await fetch(`/api/referrals?wallet=${address}`);
        
        if (response.status === 200) {
          // User is registered - trigger state update in parent
          window.dispatchEvent(new CustomEvent('userRegistered', {
            detail: { address }
          }));
        }
      } catch (error) {
        console.error('Error checking wallet status:', error);
      }
    };

    checkWalletStatus();
  }, [address, isConnected]);

  if (!error) return null;

  return (
    <div className="fixed top-16 right-4 z-50 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg border border-red-500/20 text-sm">
      {error}
    </div>
  );
} 