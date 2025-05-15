"use client";

import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { useState, useEffect } from 'react';
import Image from "next/image";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Confetti from 'react-confetti';

import Feedback from "./Feedback";
import Navbar from '../components/Navbar';
import TwitterLoginComponent from '../components/twitterLogin';
import ReferralCube from '../components/ReferralCube';

// Define the referral stats type
interface ReferralStats {
  email: string;
  wallet_address: string;
  referral_code: string;
  nickname: string;
  total_referred: number;
  remaining_uses: number;
}

interface ReferredUser {
  referred_email: string;
  referred_wallet: string;
  referred_nickname: string;
}

export default function Home() {
  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [userReferralCode, setUserReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referredUsersList, setReferredUsersList] = useState<ReferredUser[]>([]);
  const [showSignupFlow, setShowSignupFlow] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showCubeNeonEffect, setShowCubeNeonEffect] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Check URL for referral code parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        setReferralCode(refCode);
      }
    }
  }, []);

  // Get window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    if (typeof window !== 'undefined') {
        handleResize(); // Initial size
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }
    return () => {}; // Return an empty function if window is not defined
  }, []);

  // Check if user is already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (address && status === 'connected') {
        try {
          const response = await fetch(`/api/referrals?wallet=${address}`);
          if (response.ok) {
            const data = await response.json();
            setIsRegistered(true);
            setUserReferralCode(data.stats.referral_code);
            setReferralStats(data.stats);
            setUserNickname(data.stats.nickname);
            setReferredUsersList(data.referred_users || []);
          }
        } catch (error) {
          console.error('Error checking registration:', error);
        }
      }
    };

    checkRegistration();
  }, [address, status]);

  const handleSubmit = async () => {
    if (!email) {
      setMessage('Email is required');
      return;
    }
    if (!nickname) {
      setMessage('Nickname is required');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setSuccessMessage('');
  
    try {
      // Use the Next.js API route
      const response = await fetch('/api/submitWallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          wallet_address: address, 
          email,
          nickname,
          referred_by: referralCode || undefined
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setMessage("Look for an email to complete enrollment in our $CHAMPSTER loyalty program");
        setIsRegistered(true);
        setUserReferralCode(data.referral_code);
        setUserNickname(nickname);
        setShowSuccessAnimation(true);
        setShowCubeNeonEffect(true);

        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 8000);

        setTimeout(() => {
          setShowCubeNeonEffect(false);
        }, 5000);

      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to submit data. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to copy referral link to clipboard
  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${userReferralCode}`;
    navigator.clipboard.writeText(referralLink);
    setMessage('Referral link copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  const TwitterLogin = async () => {
    try {
      // Step 1: Get request token
      const { oauth_token, oauth_token_secret } = await getRequestToken();
      
      // Store oauth_token_secret in session/localStorage for Step 3
      sessionStorage.setItem('oauth_token_secret', oauth_token_secret);
      
      // Step 2: Redirect to X authorization page
      const authUrl = `https://api.x.com/oauth/authenticate?oauth_token=${oauth_token}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error during X authentication:', error);
    }
  };

  return (
    <div className="relative grid grid-rows-[auto_1fr_auto] min-h-screen pt-20 pb-20 sm:p-20 font-[family-name:var(--font-avenue-mono)] bg-gradient-to-b from-black to-[#013538] overflow-hidden">
      {/* Grids and aurora gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-[#00ff00] to-transparent opacity-15 blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#00ff00] to-transparent opacity-10 blur-3xl"></div>
    
      {/* Navbar */}
      <Navbar />
      
      {/* Main content */}
      <main className="relative flex flex-col items-center justify-center z-10 text-white text-center min-h-screen pb-20">
        {/* H1 Banner Image */}
        <div className="my-8 flex items-center justify-center gap-4 md:gap-6">
          <Image
            src="/proLogo.png" // Assuming proLogo.png is in public folder
            alt="Prospect Sports Logo"
            width={100} // Adjust width as needed
            height={100} // Adjust height as needed
            quality={100}
            priority
          />
          <span className="text-4xl font-bold">x</span>
          <Image
            src="/avax.svg" // Assuming avax.svg is in public folder
            alt="Avalanche Logo"
            width={100} // Adjust width as needed
            height={100} // Adjust height as needed
            quality={100}
            priority
          />
        </div>

        <div className="flex flex-col md:flex-row items-start justify-around gap-8 md:gap-16 w-full px-4 sm:px-0" style={{ maxWidth: '1200px' }}>
          {/* Left Content Block */}
          <div className="md:w-1/2 text-left">
            <h2 className="text-3xl font-bold mb-4">Sign up for Early Access to Prospect Sports $CHAMP!</h2>
            <p className="text-lg mb-3">Buy, Trade and Stake Athlete cards to earn Prospects $CHAMP, using our AI powered Proof-of-Performance (PoP) technology. Exclusively on Avalanche!</p>
            <p className="text-lg mb-6">PLUS Sign up and download our App to enroll in our #CHAMPSTER loyalty referral program.</p>

            {/* CASE 1: Wallet Connected AND User is Registered */}
            {status === "connected" && isRegistered && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm w-full">
                <div className="text-center mb-4">
                  <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
                    Wallet Connected
                  </p>
                  <p className="text-xs text-gray-400 font-mono break-all">{address}</p>
                </div>
                {successMessage && <p className="text-lg text-green-400 mb-2 text-center">{successMessage}</p>}
                {message && <p className="text-sm text-gray-300 mb-3 text-center">{message}</p>}
                
                <div className="text-center mb-2">
                  <p className="text-sm font-medium">Your Referral Code</p>
                  <p className="text-lg font-bold text-[#4ae5fb]">{userReferralCode}</p>
                </div>
                <button
                  onClick={copyReferralLink}
                  className="flex justify-center items-center w-full h-[45px] py-[6px] px-4 bg-[#05C1DC] text-white font-semibold text-sm uppercase tracking-[1px] rounded-full shadow-[0px_2px_2px_rgba(0,0,0,0.08),_0px_4px_4px_rgba(0,0,0,0.12)] transition-colors duration-300 hover:bg-[#04a8c0] gap-[10px] mb-4"
                >
                  Copy Referral Link
                </button>
                <button
                  className="flex justify-center items-center w-full h-[45px] py-[6px] px-4 bg-[#05C1DC] text-white font-semibold text-sm uppercase tracking-[1px] rounded-full shadow-[0px_2px_2px_rgba(0,0,0,0.08),_0px_4px_4px_rgba(0,0,0,0.12)] transition-colors duration-300 hover:bg-[#04a8c0] gap-[10px]"
                  onClick={() => disconnect()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Disconnect Wallet
                </button>
              </div>
            )}

            {/* CASE 2: Wallet Connected BUT User NOT Registered OR CASE 3 (Sub-case): Wallet NOT Connected BUT showSignupFlow is true */}
            {(status === "connected" && !isRegistered) || (status !== "connected" && showSignupFlow) ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm w-full">
                {status === "connected" && !isRegistered && ( // Wallet connected, show info
                  <div className="text-center mb-4">
                    <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
                      Wallet Connected
                    </p>
                    <p className="text-xs text-gray-400 font-mono break-all">{address}</p>
                  </div>
                )}

                {status !== "connected" && showSignupFlow && ( // Wallet not connected, but user clicked "Sign Up!"
                  <div className="mb-4 flex flex-col items-center">
                    <ConnectButton />
                    <p className="mt-2 text-xs text-gray-300">Connect your wallet to register.</p>
                  </div>
                )}
                
                {/* Registration Form Fields - Common for both sub-cases above */}
                <div className="w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email *"
                    required
                    className="w-full mb-3 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ae5fb]"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your nickname *"
                    required
                    className="w-full mb-3 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ae5fb]"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Referral code (optional)"
                    className="w-full mb-3 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ae5fb]"
                    disabled={loading}
                  />
                  <button
                    className="flex justify-center items-center w-full h-[45px] py-[6px] px-4 bg-[#05C1DC] text-white font-semibold text-sm uppercase tracking-[1px] rounded-full shadow-[0px_2px_2px_rgba(0,0,0,0.08),_0px_4px_4px_rgba(0,0,0,0.12)] transition-colors duration-300 hover:bg-[#04a8c0] gap-[10px]"
                    onClick={handleSubmit}
                    disabled={loading || status !== "connected" || !email || !nickname}
                  >
                    {loading ? 'Submitting...' : 'Register for Waitlist'}
                  </button>
                </div>
                
                {message && !successMessage && <p className="mt-4 text-sm text-red-400 text-center">{message}</p>}
                {successMessage && <p className="mt-4 text-lg text-green-400 text-center">{successMessage}</p>}


                {status === "connected" && ( // Disconnect button if wallet is connected in this flow
                  <button
                    className="flex justify-center items-center w-full h-[45px] py-[6px] px-4 bg-[#05C1DC] text-white font-semibold text-sm uppercase tracking-[1px] rounded-full shadow-[0px_2px_2px_rgba(0,0,0,0.08),_0px_4px_4px_rgba(0,0,0,0.12)] transition-colors duration-300 hover:bg-[#04a8c0] gap-[10px] mt-4"
                    onClick={() => {
                      disconnect();
                      setShowSignupFlow(false); // Optionally reset flow if they disconnect
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Disconnect Wallet
                  </button>
                )}
              </div>
            ) : null}

            {/* CASE 3: Wallet NOT Connected AND showSignupFlow is FALSE (Initial "Sign Up!" button) */}
            {status !== "connected" && !showSignupFlow && (
              <div className="flex justify-center md:justify-start mt-6">
                <button
                  onClick={() => setShowSignupFlow(true)}
                  className="flex justify-center items-center h-[45px] py-[6px] px-8 bg-[#05C1DC] text-white font-semibold text-sm uppercase tracking-[1px] rounded-full shadow-[0px_2px_2px_rgba(0,0,0,0.08),_0px_4px_4px_rgba(0,0,0,0.12)] transition-colors duration-300 hover:bg-[#04a8c0] transform hover:scale-105"
                >
                  Sign Up!
                </button>
              </div>
            )}
            
            {/* Message display for initial view if wallet not connected and error occurs before signup flow */}
            {status !== "connected" && !showSignupFlow && message && !successMessage && (
                <p className="mt-4 text-lg text-red-400 text-center">{message}</p>
            )}

          </div>

          {/* Right Image/Content Block (Rotating Cube) */}
          <div className="md:w-1/2 flex flex-col items-center justify-center aspect-square bg-gray-700/20 rounded-lg p-1 border border-white/10 min-h-[300px] md:min-h-[400px]">
            {isRegistered && userReferralCode && referralStats && userNickname ? (
              <ReferralCube 
                userReferralCode={userReferralCode} 
                referralStats={referralStats} 
                nickname={userNickname} 
                referredUsers={referredUsersList}
                neonEffectActive={showCubeNeonEffect}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <Image 
                  src="/Champster_LookingLeft.png" // Assuming Champster_LookingLeft.png is in public folder
                  alt="Champster awaiting your registration"
                  width={350} // Adjust width as needed
                  height={350} // Adjust height as needed
                  quality={100}
                  priority // If it's above the fold or important LCP element
                />
                <p className="mt-4 text-sm text-gray-300">Connect wallet & register to see your referral cube!</p>
              </div>
            )}
            {isRegistered && (
                <p className="mt-4 text-sm text-center px-4">Complete each side of the cube by referring friends to unlock new Champster memes and track your status!</p>
            )}
          </div>
        </div>
        
        {/* Horizontal referral progress bar */}
        {isRegistered && referralStats && (
          <div className="w-full max-w-2xl mt-12 px-4">
            <p className="text-lg mb-2">Your Referral Progress</p>
            {(() => {
              const maxInvites = 5;
              const actualTotalReferred = referralStats.total_referred || 0;
              const displayedTotalReferred = Math.min(actualTotalReferred, maxInvites);
              const displayedRemainingInvites = Math.max(0, maxInvites - displayedTotalReferred);

              return (
                <>
                  <div className="bg-white/10 rounded-full h-6 overflow-hidden border border-white/20">
                    <div 
                      className="bg-[#4ae5fb] h-full rounded-full flex items-center justify-center text-xs font-bold text-black"
                      style={{ width: `${(displayedTotalReferred / maxInvites) * 100}%` }}
                    >
                      {displayedTotalReferred} / {maxInvites}
                    </div>
                  </div>
                  <p className="text-sm mt-1 text-right">
                    {displayedTotalReferred} Referred | {displayedRemainingInvites} Invites Remaining
                  </p>
                </>
              );
            })()}
          </div>
        )}

        {/* Previous content - removed the main structure as it's being replaced by the new layout */}
        {/* 
          <div className="flex flex-row items-center justify-around gap-4 md:gap-8 w-full px-4 sm:px-0" style={{ maxWidth: '1200px' }}>
          // ... old layout was here ...
          </div>
        */}
         {message && !successMessage && status !== 'connected' && <p className="mt-4 text-lg text-red-400">{message}</p>}
        
      </main>

      {/* Footer - TODO: Match Home Page. Same links to apps, socials, etc */}
      
      
      {/* Feedback component, assuming it's a general utility */}
      <Feedback />

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div 
          className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[100] transition-opacity duration-500 ease-in-out opacity-100 overflow-hidden"
          onClick={() => setShowSuccessAnimation(false)}
        >
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="animate-popOutCustom">
              <Image 
                src="/Champster_SuperExcited.png" 
                alt="Successfully Registered!"
                width={400}
                height={400}
                quality={100}
                className="object-contain w-full h-full"
              />
            </div>
          </div>
          <h2 className="absolute bottom-10 left-1/2 -translate-x-1/2 text-4xl font-bold text-white animate-fadeInDelayCustom z-10">You&rsquo;re Signed up! We Ball!</h2>
        </div>
      )}

      {/* This seems to be related to Twitter login, keeping it for now but might need review based on new UX */}
      {/* <TwitterLoginComponent /> */}
      <footer className="relative z-10 w-full py-0 text-center text-white border-t border-white/10 mt-12">
        <p>&copy; {new Date().getFullYear()} Prospect Sports. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-4">
          {/* TODO: Add actual links */}
          <Link href="/terms" className="hover:text-[#4ae5fb]">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-[#4ae5fb]">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-[#4ae5fb]">Contact</Link>
          {/* TODO: Add links to apps, socials, etc. */}
        </div>
      </footer>
    </div>
  );
}

function getRequestToken(): { oauth_token: string; oauth_token_secret: string; } | PromiseLike<{ oauth_token: string; oauth_token_secret: string; }> {
  throw new Error('Function not implemented.');
}

