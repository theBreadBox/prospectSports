"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SignupCube from '../../components/SignupCube.jsx';

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

  // Check if user is already connected with wallet
  useEffect(() => {
    if (address && status === 'connected') {
      // Move to step 2 if they're connected
      advanceStep();
    }
  }, [address, status]);

  const advanceStep = () => {
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
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage('Email is required');
      return;
    }
    advanceStep();
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
            
            <p className="text-lg sm:text-xl mb-10">
              PLUS Sign up and download our App to enroll in our #CHAMPSTER loyalty referral program.
            </p>
            
            {!signupComplete && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
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
                            className="flex-1 py-2 px-4 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                            onClick={() => disconnect()}
                          >
                            Disconnect
                          </button>
                          <button
                            className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-[#4ae5fb] to-[#00ff00] text-black font-bold hover:opacity-90 transition-opacity"
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