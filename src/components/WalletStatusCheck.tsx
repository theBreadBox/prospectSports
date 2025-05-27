"use client";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';

export default function WalletStatusCheck() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(false);

  // Pages that should check registration status
  const checkablePaths = ['/', '/signup'];

  useEffect(() => {
    const checkWalletStatus = async () => {
      // Skip if already on the referral page
      if (pathname === '/referral') {
        return;
      }
      
      // Only check on relevant pages and when wallet is connected
      if (isConnected && address && !isChecking && checkablePaths.includes(pathname || '')) {
        try {
          setIsChecking(true);
          
          // Use the referrals API to check if the wallet exists
          const response = await fetch(`/api/referrals?wallet=${address}`);
          
          // If status is 200, the wallet IS registered, redirect to referral page
          if (response.status === 200) {
            // User is registered, send to referral page
            router.push('/referral');
          }
          // If status is 404, the wallet is NOT registered
          // No need to do anything, they should stay on current page
          
        } catch (error) {
          console.error('Error checking wallet status:', error);
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkWalletStatus();
  }, [address, isConnected, router, isChecking, pathname]);

  // This component doesn't render anything visible
  return null;
} 