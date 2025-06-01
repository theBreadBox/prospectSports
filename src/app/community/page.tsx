"use client";

import { useState, useEffect } from 'react';
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamic import for ReferralCube to avoid SSR issues with Three.js
const ReferralCube = dynamic(() => import('@/components/ReferralCube'), {
  ssr: false,
  loading: () => <p className="text-center">Loading Cube...</p>
});

// Define the referral stats type
interface ReferralStats {
  email: string;
  wallet_address: string;
  referral_code: string;
  total_referred: number;
  remaining_uses: number;
}

interface ReferredUser {
  referred_email: string;
  referred_wallet: string;
}

export default function CommunityPage() {
  const { address, status } = useAccount();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [userReferralCode, setUserReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referredUsersList, setReferredUsersList] = useState<ReferredUser[]>([]);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  // Check if user is already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (address && status === 'connected') {
        setCheckingRegistration(true);
        try {
          const response = await fetch(`/api/referrals?wallet=${address}`);
          if (response.ok) {
            const data = await response.json();
            setIsRegistered(true);
            setUserReferralCode(data.stats.referral_code);
            setReferralStats(data.stats);
            setReferredUsersList(data.referred_users || []);
          } else {
            // User not registered, redirect to home page for registration
            setIsRegistered(false);
            router.push('/?from=community');
          }
        } catch (error) {
          console.error('Error checking registration:', error);
          setIsRegistered(false);
          router.push('/?from=community');
        } finally {
          setCheckingRegistration(false);
        }
      } else if (status === 'disconnected') {
        // No wallet connected, redirect to home page
        setCheckingRegistration(false);
        router.push('/?from=community');
      }
    };

    if (status !== 'connecting') {
      checkRegistration();
    }
  }, [address, status, router]);

  // Handle copy referral code
  const handleCopyCode = () => {
    if (userReferralCode) {
      navigator.clipboard.writeText(`${window.location.origin}/?ref=${userReferralCode}`);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  // Show loading state while checking registration
  if (checkingRegistration || status === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001118] to-[#002030] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#05C1DC] mx-auto mb-4"></div>
          <p>Checking registration status...</p>
        </div>
      </div>
    );
  }

  // Show message if not registered (should redirect, but show message as fallback)
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001118] to-[#002030] flex items-center justify-center">
        <div className="text-white text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold mb-4">Registration Required</h2>
          <p className="mb-6">You need to complete registration before accessing the community page.</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-[#05C1DC] text-white rounded-lg hover:bg-[#05C1DC]/80 transition-colors"
          >
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  // Referral steps - 6 steps for tracking referrals
  const referralSteps = [
    { id: 1, active: (referredUsersList?.length || 0) >= 1, label: "Ref 1" },
    { id: 2, active: (referredUsersList?.length || 0) >= 2, label: "Ref 2" },
    { id: 3, active: (referredUsersList?.length || 0) >= 3, label: "Ref 3" },
    { id: 4, active: (referredUsersList?.length || 0) >= 4, label: "Ref 4" },
    { id: 5, active: (referredUsersList?.length || 0) >= 5, label: "Ref 5" },
    { id: 6, active: (referredUsersList?.length || 0) >= 6, label: "Ref 6" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001118] to-[#002030]">
      {/* Header */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            COMMUNITY
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Welcome to the Prospect community! Track your referrals and unlock exclusive rewards.
          </p>
        </div>
      </div>

      {/* Community Content */}
      <div className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* User Stats Card */}
          <div className="bg-[#0F1923] rounded-2xl p-8 mb-8 border border-[#00354d]">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{referralStats?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Referrals:</span>
                    <span className="text-[#05C1DC] font-bold">{referralStats?.total_referred || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Remaining Uses:</span>
                    <span className="text-white">{referralStats?.remaining_uses || 0}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Your Referral Code</h3>
                <div className="bg-[#001118] rounded-lg p-4 border border-[#00354d]">
                  <div className="flex items-center justify-between">
                    <code className="text-[#05C1DC] font-mono">{userReferralCode}</code>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 hover:bg-[#00354d] rounded-lg transition-colors"
                    >
                      {codeCopied ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Share: {typeof window !== 'undefined' ? window.location.origin : ''}/?ref={userReferralCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Progress */}
          <div className="bg-[#0F1923] rounded-2xl p-8 mb-8 border border-[#00354d]">
            <h3 className="text-2xl font-bold text-white mb-6">Referral Progress</h3>
            <div className="grid grid-cols-6 gap-4">
              {referralSteps.map((step) => (
                <div
                  key={step.id}
                  className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${
                    step.active
                      ? 'border-[#05C1DC] bg-[#05C1DC]/10 text-[#05C1DC]'
                      : 'border-[#00354d] bg-[#001118] text-gray-400'
                  }`}
                >
                  <div className="text-lg font-bold">{step.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Referred Users */}
          {referredUsersList && referredUsersList.length > 0 && (
            <div className="bg-[#0F1923] rounded-2xl p-8 border border-[#00354d]">
              <h3 className="text-2xl font-bold text-white mb-6">Your Referrals</h3>
              <div className="space-y-4">
                {referredUsersList.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#001118] rounded-lg border border-[#00354d]"
                  >
                    <div>
                      <div className="text-white font-medium">{user.referred_email}</div>
                      <div className="text-gray-400 text-sm font-mono">
                        {user.referred_wallet.slice(0, 6)}...{user.referred_wallet.slice(-4)}
                      </div>
                    </div>
                    <div className="text-[#05C1DC] font-bold">✓</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3D Cube */}
          <div className="mt-12 text-center">
            <div className="w-full h-96 relative">
              <ReferralCube 
                userReferralCode={userReferralCode}
                referralStats={{ total_referred: referralStats?.total_referred || 0 }}
                referredUsers={referredUsersList}
                neonEffectActive={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
