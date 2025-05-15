"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SimpleReferralCube from '../../components/SimpleReferralCube.jsx';

// Define the referral stats type
interface ReferralStats {
  email: string;
  wallet_address: string;
  referral_code: string;
  total_referred: number;
  remaining_uses: number;
}

// Define the referred user type
interface ReferredUser {
  referred_email: string;
  referred_wallet: string;
}

export default function ReferralPage() {
  const { address, status } = useAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [userReferralCode, setUserReferralCode] = useState('');
  const [message, setMessage] = useState('');
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [allSidesCompleted, setAllSidesCompleted] = useState(false);

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
            setError('You are not registered yet. Register on the signup page to get your referral code.');
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
        setReferredUsers(data.referred_users || []);
        
        // Check if all sides are completed (5 referrals is max)
        if (data.stats.total_referred >= 5) {
          setAllSidesCompleted(true);
        }
        
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
    const referralLink = `${window.location.origin}/signup?ref=${userReferralCode}`;
    navigator.clipboard.writeText(referralLink);
    setMessage('Referral link copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="relative grid grid-rows-[1fr_auto] min-h-screen pt-20 pb-20 sm:p-20 font-[family-name:var(--font-avenue-mono)] bg-gradient-to-b from-black to-[#013538] overflow-hidden">
      {/* Grids and aurora gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-[#00ff00] to-transparent opacity-15 blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#00ff00] to-transparent opacity-10 blur-3xl"></div>
      
      {/* Navbar */}
      <Navbar />
      
      {/* Main content */}
      <main className="relative flex flex-col items-center justify-center z-10 text-white text-center p-4 sm:p-8">
        {/* Banner with logos */}
        <div className="flex flex-row items-center justify-center gap-6 mb-10 w-full">
          <Image
            src="/proLogo.png"
            alt="Prospect Sports logo"
            width={150}
            height={150}
            quality={100}
            priority
          />
          <h1 className="text-2xl sm:text-4xl font-bold text-white">x</h1>
          <Image
            src="/avax.svg"
            alt="Avalanche logo"
            width={150}
            height={150}
            quality={100}
            priority
          />
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-[#4ae5fb] to-[#00ff00] bg-clip-text text-transparent">
          $CHAMPSTER Referral Program
        </h1>
        
        {!address || status !== 'connected' ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="mb-6">Connect your wallet to view your referral status and share your code.</p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#4ae5fb] to-[#00ff00] text-black font-bold hover:opacity-90 transition-opacity"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4ae5fb]"></div>
          </div>
        ) : error ? (
          <div className="bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-400">Error</h2>
            <p className="mb-6">{error}</p>
            <Link 
              href="/signup"
              className="block w-full py-3 rounded-lg bg-gradient-to-r from-[#4ae5fb] to-[#00ff00] text-black font-bold hover:opacity-90 transition-opacity text-center"
            >
              Go to Signup
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-10 mb-10">
              {/* Left side - Referral info */}
              <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Your Referral Code</h2>
                
                <div className="flex flex-col items-center mb-8">
                  <p className="text-3xl font-bold text-[#4ae5fb] mb-4">{userReferralCode}</p>
                  
                  <button
                    onClick={copyReferralLink}
                    className="px-6 py-3 rounded-lg bg-[#4ae5fb]/20 hover:bg-[#4ae5fb]/30 text-[#4ae5fb] transition-colors"
                  >
                    Copy Referral Link
                  </button>
                  
                  {message && (
                    <p className="mt-2 text-sm text-[#4ae5fb] animate-pulse">{message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">People Referred</p>
                    <p className="text-3xl font-bold text-[#00ff00]">
                      {referralStats?.total_referred || 0}
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Remaining Invites</p>
                    <p className="text-3xl font-bold text-[#4ae5fb]">
                      {referralStats?.remaining_uses || 5}
                    </p>
                  </div>
                </div>
                
                <p className="mb-6 text-sm">
                  Invite friends to join Prospect Sports and earn rewards. Each referral unlocks a new meme on the cube!
                </p>
                
                {allSidesCompleted && (
                  <div className="bg-gradient-to-r from-[#4ae5fb]/20 to-[#00ff00]/20 rounded-lg p-4 border border-[#00ff00] animate-pulse">
                    <p className="font-bold text-lg mb-1">🎉 Congratulations!</p>
                    <p>You have completed all referrals! Check your email for special rewards.</p>
                  </div>
                )}
              </div>
              
              {/* Right side - Interactive Cube */}
              <div className="flex-1 h-[500px]">
                <SimpleReferralCube 
                  totalReferred={referralStats?.total_referred || 0}
                  allCompleted={allSidesCompleted}
                />
              </div>
            </div>
            
            {/* Bottom progress bar */}
            <div className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="flex justify-between mb-2">
                <span>Referral Progress</span>
                <span>{referralStats?.total_referred || 0} out of 5 referrals complete</span>
              </div>
              
              <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#4ae5fb] to-[#00ff00] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, ((referralStats?.total_referred || 0) / 5) * 100)}%` }}
                ></div>
              </div>
              
              {referredUsers.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-3">Your Referrals</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {referredUsers.map((user, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-3 text-left">
                        <p className="text-sm text-gray-400">Referred User {index + 1}</p>
                        <p className="text-xs font-mono truncate">{user.referred_wallet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 