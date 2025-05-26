"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SignupCube from '../../components/SignupCube.jsx';
import TwitterButton from '../../components/TwitterButton';

interface SignupStep {
  completed: boolean;
  current: boolean;
}

export default function Signup() {
  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<SignupStep[]>([
    { completed: false, current: true },   // Email step
    { completed: false, current: false },  // Wallet connect step
    { completed: false, current: false },  // Confirmation step
  ]);
  const [twitterSignInLoading, setTwitterSignInLoading] = useState(false);
  
  // Debug logs
  useEffect(() => {
    console.log("Current step:", currentStep);
  }, [currentStep]);

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

  const advanceStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const newSteps = [...steps];
      newSteps[currentStep].completed = true;
      newSteps[currentStep].current = false;
      newSteps[currentStep + 1].current = true;
      setSteps(newSteps);
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      const newSteps = [...steps];
      newSteps[currentStep].completed = true;
      setSteps(newSteps);
      setSignupComplete(true);
    }
  }, [currentStep, steps]);

  // Check if user is already connected with wallet
  useEffect(() => {
    // Log wallet connection status for debugging
    console.log("Wallet status:", status, "Address:", address, "Current step:", currentStep);
  }, [address, status, currentStep]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage('Email is required');
      return;
    }
    advanceStep();
  };

  const handleTwitterSignIn = async () => {
    setTwitterSignInLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/x/request-token', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to initiate Twitter sign-in.');
        setTwitterSignInLoading(false);
        return;
      }
      const { oauth_token } = await response.json();
      // Redirect to Twitter authorization URL
      window.location.href = `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`;
      // Note: setTwitterSignInLoading(false) might not be reached if redirection happens immediately.
      // Consider handling this based on redirection behavior or if an error occurs before redirection.
    } catch (error) {
      console.error('Error during Twitter sign-in:', error);
      setMessage('An error occurred during Twitter sign-in. Please try again.');
      setTwitterSignInLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email) {
      setMessage('Email is required');
      return;
    }
    if (!address) {
      setMessage('Please connect your wallet');
      return;
    }
    
    setLoading(true);
    setMessage('');
  
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
          referred_by: referralCode || undefined
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setMessage('Registration successful!');
        setIsRegistered(true);
        advanceStep(); // Move to final step
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
        
        <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-10 items-center">
          {/* Left Content Panel */}
          <div className="flex-1 max-w-xl text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-[#4ae5fb] to-[#00ff00] bg-clip-text text-transparent">
              Sign up for Early Access to Prospect Sports $CHAMP!
            </h1>
            
            <p className="text-lg sm:text-xl mb-6">
              Buy, Trade and Stake Athlete cards to earn Prospects $CHAMP, using our AI powered Proof-of-Performance (PoP) technology. Exclusively on Avalanche!
            </p>
            
            <p className="text-lg sm:text-xl mb-6">
              PLUS Sign up and download our App to enroll in our #CHAMPSTER loyalty referral program.
            </p>
            
            {/* Twitter button directly in the intro area */}
            <button
              type="button"
              onClick={handleTwitterSignIn}
              disabled={twitterSignInLoading}
              className="w-full py-3 mb-8 rounded-lg bg-[#1DA1F2] text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center"
              style={{zIndex: 9999}}
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.67.9-.53 1.59-1.37 1.92-2.38-.84.5-1.77.86-2.76 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.94.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.21 0-.42-.01-.63.84-.6 1.56-1.36 2.14-2.16z" />
              </svg>
              {twitterSignInLoading ? 'Connecting...' : 'Sign in with Twitter'}
            </button>
            
            {!signupComplete && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                <div className="relative flex py-4 items-center my-4">
                  <div className="flex-grow border-t border-gray-400"></div>
                  <span className="flex-shrink mx-4 text-gray-400">Or Register With Email</span>
                  <div className="flex-grow border-t border-gray-400"></div>
                </div>
                
                {currentStep === 0 && (
                  <form onSubmit={handleEmailSubmit}>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ae5fb]"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="referralCode" className="block text-sm font-medium mb-2">Referral Code (optional)</label>
                      <input
                        type="text"
                        id="referralCode"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder="Enter referral code"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ae5fb]"
                      />
                    </div>
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-400"></div>
                        <span className="flex-shrink mx-4 text-gray-400">Or</span>
                        <div className="flex-grow border-t border-gray-400"></div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-[#4ae5fb] to-[#00ff00] text-black font-bold hover:opacity-90 transition-opacity"
                    >
                      Continue
                    </button>
                  </form>
                )}
                
                {currentStep === 1 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Connect Your Wallet</h3>
                    <p className="mb-4">Connect your crypto wallet to secure your spot in the $CHAMPSTER loyalty program.</p>
                    
                    {status === "connected" ? (
                      <div className="text-center mb-4">
                        <p className="text-sm sm:text-base font-medium mb-1">Wallet Connected</p>
                        <p className="text-xs text-gray-400 font-mono mb-4">{address}</p>
                        
                        <div className="flex gap-4">
                          <button
                            className="flex-1 w-full py-2 px-6 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                            onClick={() => disconnect()}
                          >
                            Disconnect
                          </button>
                          <button
                            className="flex-1 w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[#4ae5fb] to-[#00ff00] text-black font-bold hover:opacity-90 transition-opacity"
                            onClick={handleSubmit}
                            disabled={loading}
                          >
                            {loading ? 'Submitting...' : 'Continue'}
                          </button>
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-4">Confirming Registration</h3>
                    {loading ? (
                      <p>Processing your registration...</p>
                    ) : (
                      <p>{message || "Your registration is being processed..."}</p>
                    )}
                  </div>
                )}
                
                {message && <p className="mt-4 text-center text-sm">{message}</p>}
              </div>
            )}
            
            {signupComplete && (
              <div className="bg-white/5 backdrop-blur-sm border border-[#00ff00] rounded-xl p-6 mb-6 border-2 animate-pulse">
                <h3 className="text-2xl font-bold mb-4 text-center">You&apos;re Signed up! We Ball! 🎉</h3>
                <p className="mb-3">Look for an email to complete enrollment in our $CHAMPSTER loyalty referral program.</p>
                <p className="mb-4">Complete each side of the cube to unlock new Champster memes and track your status.</p>
                <Link 
                  href="/referral"
                  className="block w-full py-3 rounded-lg bg-gradient-to-r from-[#4ae5fb] to-[#00ff00] text-black font-bold hover:opacity-90 transition-opacity text-center"
                >
                  Start Referring Friends
                </Link>
              </div>
            )}
          </div>
          
          {/* Right Content Panel (Interactive 3D Cube) */}
          <div className="flex-1 max-w-xl h-[500px]">
            <SignupCube 
              currentStep={currentStep} 
              signupComplete={signupComplete}
              onCubeClick={() => {
                if (currentStep === 0) {
                  document.getElementById('email')?.focus();
                } else if (currentStep === 1 && status !== 'connected') {
                  document.querySelector<HTMLButtonElement>('button[data-testid="rk-connect-button"]')?.click();
                }
              }}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 