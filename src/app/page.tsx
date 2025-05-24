"use client";

import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Wallet, LogOut, Copy, Check, CheckCircle2 } from "lucide-react";

import Feedback from "./Feedback";
import Navbar from '../components/Navbar';
import TwitterSignInButton from '../components/TwitterButton';
import ReferralCube from '../components/ReferralCube';

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

export default function Home() {
  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [userReferralCode, setUserReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referredUsersList, setReferredUsersList] = useState<ReferredUser[]>([]);
  const [showSignupFlow, setShowSignupFlow] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showCubeNeonEffect, setShowCubeNeonEffect] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  // New UI state variables to match Community.tsx design
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);
  const [isWalletHovered, setIsWalletHovered] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [showReferralSteps, setShowReferralSteps] = useState<boolean>(false);

  // References for animations
  const cubeContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // InView hook for animation
  const { ref: heroRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

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

  // Update form fields when wallet is connected
  useEffect(() => {
    if (status === 'connected') {
      setActiveStep(2);
      if (!completedSteps.includes(1)) {
        setCompletedSteps([...completedSteps, 1]);
      }
    }
  }, [status]);

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
            setReferredUsersList(data.referred_users || []);
            setEmail(data.stats.email || '');
            
            // If user is already registered, show referral section
            setIsFormComplete(true);
            setShowReferralSteps(true);
            setCompletedSteps([1, 2, 3, 4]);
          }
        } catch (error) {
          console.error('Error checking registration:', error);
        }
      }
    };

    checkRegistration();
  }, [address, status]);

  // Progress steps - 4 steps as shown in Community.tsx
  const progressSteps = [
    { id: 1, active: completedSteps.includes(1), label: "Connect Wallet" },
    { id: 2, active: completedSteps.includes(2), label: "Enter Email" },
    { id: 3, active: completedSteps.includes(3), label: "Sign-in with X (Optional)" },
    { id: 4, active: completedSteps.includes(4), label: "Referral Code" }
  ];

  // Referral steps - 6 steps for tracking referrals
  const referralSteps = [
    { id: 1, active: (referredUsersList?.length || 0) >= 1, label: "Referral 1" },
    { id: 2, active: (referredUsersList?.length || 0) >= 2, label: "Referral 2" },
    { id: 3, active: (referredUsersList?.length || 0) >= 3, label: "Referral 3" },
    { id: 4, active: (referredUsersList?.length || 0) >= 4, label: "Referral 4" },
    { id: 5, active: (referredUsersList?.length || 0) >= 5, label: "Referral 5" },
    { id: 6, active: (referredUsersList?.length || 0) >= 6, label: "Referral 6" }
  ];

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Navigate to a specific step
  const navigateToStep = (step: number) => {
    if (step <= activeStep && step >= 1 && step <= 4) {
      setActiveStep(step);
    }
  };

  // Handle input change
  const handleInputChange = (value: string, field: 'email' | 'referralCode') => {
    if (field === 'email') {
      setEmail(value);
      setEmailError("");
      setIsFormValid(isValidEmail(value));
    } else if (field === 'referralCode') {
      setReferralCode(value);
    }
  };

  // Handle email blur
  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else if (isValidEmail(email)) {
      if (!completedSteps.includes(2)) {
        setCompletedSteps([...completedSteps, 2]);
      }
      if (!completedSteps.includes(3)) {
        setCompletedSteps([...completedSteps, 3]);
      }
      setActiveStep(4);
    }
  };

  // Handle copying referral code to clipboard
  const handleCopyCode = () => {
    const referralLink = `${window.location.origin}?ref=${userReferralCode}`;
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
      });
  };

  // Skip referral input
  const handleSkipReferral = () => {
    if (!completedSteps.includes(4)) {
      setCompletedSteps([...completedSteps, 4]);
    }
    setShowSuccessMessage(true);
  };

  // Handle form submission - KEEPING YOUR EXISTING FUNCTIONALITY
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
   
    if (!address || status !== 'connected') {
      console.error("Wallet not connected for form submission");
      return;
    }
    
    setLoading(true);
    setMessage('');
    setSuccessMessage('');
  
    try {
      // Use your existing API route
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
        setMessage("Look for an email to complete enrollment in our $CHAMPSTER loyalty program");
        setIsRegistered(true);
        setUserReferralCode(data.referral_code);
        
        // Mark step 4 as completed
        if (!completedSteps.includes(4)) {
          setCompletedSteps([...completedSteps, 4]);
        }
        
        setShowSuccessMessage(true);
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
        setEmailError(errorData.error || 'Failed to submit data. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Error submitting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      setMessage(errorMessage);
      setEmailError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Move to the referral step
  const handleNextToReferrals = () => {
    setShowSuccessMessage(false);
    setIsFormComplete(true);
    setShowReferralSteps(true);
    
    // Scroll to the referral section
    setTimeout(() => {
      const referralSection = document.getElementById('referral-section');
      if (referralSection) {
        referralSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Handle keypress on form fields for progression
  const handleKeyPress = (e: React.KeyboardEvent, field: 'email' | 'referralCode') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (field === 'email') {
        const emailValue = email;
        if (!isValidEmail(emailValue)) {
          setEmailError("Please enter a valid email address");
          return;
        }
        
        if (!completedSteps.includes(2)) {
          setCompletedSteps([...completedSteps, 2]);
        }
        if (!completedSteps.includes(3)) {
          setCompletedSteps([...completedSteps, 3]);
        }
        setActiveStep(4);
      } else if (field === 'referralCode') {
        if (isFormValid) {
          handleSubmit();
        }
      }
    }
  };

  return (
    <div className="bg-[#001118] flex flex-col justify-center items-center w-full min-h-screen font-['Poppins']">
      {/* Sticky Progress Bar - fixed padding of 48px from top */}
      <div className="sticky top-0 z-50 w-full bg-[#001118] pt-12">
        <div className="w-full max-w-[1080px] mx-auto px-4">
          {!showReferralSteps ? (
            // Registration Progress Steps (4 steps) - updated with pill design and colors from image
            <div className="flex overflow-hidden rounded-full">
              {progressSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`relative flex-1 h-12 flex items-center justify-center cursor-pointer transition-all duration-300
                    ${step.active ? "bg-[#92249a]" : "bg-[#0c1622]"} 
                     ${index === 0 ? "rounded-l-full" : ""} 
                     ${index === progressSteps.length - 1 ? "rounded-r-full" : ""}
                  `}
                  onClick={() => navigateToStep(step.id)}
                  style={{
                    backgroundImage: step.active ? 'url(https://i.postimg.cc/pLQcVRM9/banner-bg-img.png)' : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: step.active ? 'none' : '1px solid #00354d'
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-sm font-bold text-white flex items-center gap-1">
                      STEP {step.id} {step.active && <CheckCircle2 size={14} className="text-[#59ff83]" />}
                    </div>
                    {/* Only show label on desktop */}
                    <div className="text-xs mt-0.5 text-white hidden md:block">
                      {step.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Referral Progress Steps (6 steps) - updated with pill design and colors from image */}
              <div className="flex overflow-hidden rounded-full">
                {referralSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`relative flex-1 h-10 flex items-center justify-center transition-all duration-300
                      ${step.active ? "bg-[#92249a]" : "bg-[#0c1622]"} 
                       ${index === 0 ? "rounded-l-full" : ""} 
                       ${index === referralSteps.length - 1 ? "rounded-r-full" : ""}
                      ${!step.active ? "pointer-events-none opacity-70" : ""}
                     `}
                    style={{
                      backgroundImage: step.active ? 'url(https://i.postimg.cc/pLQcVRM9/banner-bg-img.png)' : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: step.active ? 'none' : '1px solid #00354d'
                    }}
                  >
                    <div className="text-sm font-medium flex items-center gap-1">
                      <span className="text-white">
                        Referral {step.id}
                      </span>
                      {step.active && <CheckCircle2 size={14} className="text-[#59ff83]" />}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        </div>

      <div className="bg-[#001118] w-full max-w-[1080px] px-4 md:px-8 lg:px-12 mt-8">
        <div className="flex flex-col w-full items-center relative">
          {!isFormComplete ? (
            !showSuccessMessage ? (
              /* Main content section - updated with two-column layout */
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 w-full max-w-[1080px] mb-4 pt-12">
                {/* Left content (text) */}
                <div className="flex flex-col w-full md:w-1/2 items-start gap-3">
                  <motion.h1 
                    className="font-bold text-[#ffffff] text-[45px] md:text-[66px] leading-tight md:leading-[1.212em] tracking-[-.01em] mt-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    The $CHAMP<br />is&nbsp;here!
                  </motion.h1>

                  <div className="flex flex-col gap-[18px]">
                    <motion.p 
                      className="text-[#59ff83] text-base md:text-lg font-semibold"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      Sign-up for the upcoming $CHAMP token&nbsp;whitelist.
                    </motion.p>

                    <motion.p 
                      className="text-neutral-light-10 text-base md:text-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      PLUS download the app and refer your friends to secure your allocation and qualify for the&nbsp;airdrop.
                    </motion.p>
                </div>
                
                  {/* Registration form section moved to left column */}
                  <div className="w-full max-w-[375px] flex flex-col gap-5 mt-6">
                    {/* Form fields */}
                    {status !== "connected" ? (
                      <div className="w-full border-none">
                        <div className="relative w-full h-36 bg-[url(/intersect.svg)] bg-cover bg-no-repeat">
                          <div className="absolute w-full top-[37px] left-0 right-0 font-normal text-[#59ff83] text-xl text-center leading-[35px]">
                            Connect your wallet to start<br />
                            registration process!
                          </div>
                </div>
                        <div className="flex flex-col items-center mt-4">
                          <ConnectButton.Custom>
                            {({
                              account,
                              chain,
                              openAccountModal,
                              openChainModal,
                              openConnectModal,
                              authenticationStatus,
                              mounted,
                            }) => {
                              const ready = mounted && authenticationStatus !== 'loading';
                              const connected =
                                ready &&
                                account &&
                                chain &&
                                (!authenticationStatus ||
                                  authenticationStatus === 'authenticated');

                              return (
                                <div
                                  {...(!ready && {
                                    'aria-hidden': true,
                                    'style': {
                                      opacity: 0,
                                      pointerEvents: 'none',
                                      userSelect: 'none',
                                    },
                                  })}
                                >
                                  {(() => {
                                    if (!connected) {
                                      return (
                <button
                                          onClick={openConnectModal}
                                          type="button"
                                          className="flex items-center justify-center h-[45px] rounded-[80px] transition-all duration-300 bg-[#59ff83] hover:text-white text-[#092a36] px-6"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Wallet size={20} />
                                            <span className="font-semibold text-center tracking-[1px] whitespace-nowrap">
                                              CONNECT WALLET
                                            </span>
                                          </div>
                                        </button>
                                      );
                                    }

                                    if (chain.unsupported) {
                                      return (
                                        <button onClick={openChainModal} type="button" className="bg-red-500 text-white">
                                          Wrong network
                </button>
                                      );
                                    }

                                    return (
                                      <div style={{ display: 'flex', gap: '12px' }}>
                <button
                                          onClick={openAccountModal}
                                          type="button"
                                          className="flex items-center justify-center h-[40px] rounded-[80px] transition-all duration-300 bg-[#59ff83] hover:text-white text-[#092a36] px-2"
                                          onMouseEnter={() => setIsWalletHovered(true)}
                                          onMouseLeave={() => setIsWalletHovered(false)}
                                        >
                                          <div className="flex items-center gap-1">
                                            {isWalletHovered ? <LogOut size={18} /> : <Wallet size={18} />}
                                            <span className="font-semibold text-center tracking-[1px] text-xs whitespace-nowrap">
                                              {account.displayName.substring(0, 6)}...
                                            </span>
                                          </div>
                </button>
                                      </div>
                                    );
                                  })()}
                                </div>
                              );
                            }}
                          </ConnectButton.Custom>
                          
                          {/* Already Registered text - only show when wallet is not connected */}
                          <div className="text-[#59ff83] text-sm mt-4">
                            Already Registered? Connect to see your Referrals
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form 
                        id="signup-form"
                        onSubmit={handleSubmit}
                        className="flex flex-col items-start gap-5 w-full"
                      >
                        {status === "connected" && !isRegistered && (
                          <div className="w-full relative h-[70px]">
                            <div className="w-full absolute top-0 left-0 transition-all duration-300 opacity-100 z-10">
                              <div className="relative w-full h-[46px] bg-neutraldark-900 rounded-[10px] overflow-hidden border border-solid border-[#00354d]">
                                <input
                                  type="text"
                                  id="email"
                                  name="email"
                                  value={email}
                                  onChange={(e) => handleInputChange(e.target.value, 'email')}
                                  onKeyDown={(e) => handleKeyPress(e, "email")}
                                  onBlur={handleEmailBlur}
                                  placeholder="Enter your email"
                                  className="h-full w-full bg-transparent border-none text-neutral-mid-80 placeholder-neutral-mid-80 px-4"
                                  required={true}
                                />
                                <div className="absolute top-2.5 right-3 text-[#ff394a]">
                                  *
                                </div>
                              </div>
                              {emailError && (
                                <div className="text-[#ff394a] text-sm mt-1">
                                  {emailError}
              </div>
            )}
                            </div>
                  </div>
                )}

                        {activeStep === 3 && (
                          <div className="w-full">
                            <TwitterSignInButton />
                            <button 
                              type="button"
                              className="w-full mt-2 bg-transparent border border-[#00354d] hover:bg-[#001118]/50 text-[#59ff83] h-10 rounded-lg text-sm"
                              onClick={() => {
                                if (!completedSteps.includes(3)) {
                                  setCompletedSteps([...completedSteps, 3]);
                                }
                                setActiveStep(4);
                                setIsFormValid(isValidEmail(email));
                              }}
                            >
                              Don&apos;t have Twitter?
                            </button>
                  </div>
                )}
                
                        {activeStep === 4 && (
                <div className="w-full">
                            <div className="relative w-full h-[46px] bg-neutraldark-900 rounded-[10px] overflow-hidden border border-solid border-[#00354d]">
                  <input
                    type="text"
                                id="referral"
                                name="referral"
                    value={referralCode}
                                onChange={(e) => handleInputChange(e.target.value, 'referralCode')}
                                onKeyDown={(e) => handleKeyPress(e, "referralCode")}
                                placeholder="Referral code (Optional)"
                                className="h-full w-full bg-transparent border-none text-neutral-mid-80 placeholder-neutral-mid-80 px-4 pr-16"
                              />

                              {/* Skip button */}
                              <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 bg-transparent hover:bg-[#001118]/50 text-[#59ff83] text-sm rounded-md"
                                onClick={handleSkipReferral}
                              >
                                Skip
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Wallet connection and submit button */}
                        {status === "connected" && (
                          <div className="flex w-full gap-2 items-center">
                            <ConnectButton.Custom>
                              {({
                                account,
                                chain,
                                openAccountModal,
                                openChainModal,
                                openConnectModal,
                                authenticationStatus,
                                mounted,
                              }) => {
                                const ready = mounted && authenticationStatus !== 'loading';
                                const connected =
                                  ready &&
                                  account &&
                                  chain &&
                                  (!authenticationStatus ||
                                    authenticationStatus === 'authenticated');

                                return (
                                  <div
                                    {...(!ready && {
                                      'aria-hidden': true,
                                      'style': {
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                      },
                                    })}
                                  >
                                    {connected && (
                                      <button
                                        type="button"
                                        className={`flex items-center justify-center h-[40px] rounded-[80px] transition-all duration-300 ${
                                          isWalletHovered 
                                            ? "bg-red-500 text-white px-2" 
                                            : "bg-[#59ff83] hover:text-white text-[#092a36] px-2"
                                        }`}
                                        onClick={openAccountModal}
                                        onMouseEnter={() => setIsWalletHovered(true)}
                                        onMouseLeave={() => setIsWalletHovered(false)}
                                      >
                                        <div className="flex items-center gap-1">
                                          {isWalletHovered ? <LogOut size={18} /> : <Wallet size={18} />}
                                          <span className="font-semibold text-center tracking-[1px] text-xs whitespace-nowrap">
                                            DISCONNECT
                                          </span>
                                        </div>
                                      </button>
                                    )}
                                  </div>
                                );
                              }}
                            </ConnectButton.Custom>

                  <button
                              type="submit"
                              form="signup-form"
                              disabled={!isFormValid || loading}
                              className={`flex-1 h-[40px] rounded-[80px] shadow-elevation-1 transition-all duration-300 ${
                                isFormValid && !loading ? "opacity-100 bg-[#05C1DC]" : "opacity-50 bg-[#05C1DC]"
                              }`}
                            >
                              <span className="text-white font-semibold text-center tracking-[1px] text-xs whitespace-nowrap">
                                {loading ? "REGISTERING..." : (activeStep < 4 ? "NEXT" : "REGISTER")}
                              </span>
                  </button>
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                </div>
                
                {/* Right content - cube animation */}
                <div className="flex flex-col w-full md:w-1/2 items-center" id="registration-form">
                  {/* Unrevealed animation - using WebM video */}
                  <div className="relative w-[350px] h-[350px] flex items-center justify-center" ref={cubeContainerRef}>
                    <video
                      ref={videoRef}
                      src="https://kalapa.agency/prospects_animated_cube.webm"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Success Message - shown after form completion */
              <div className="w-full max-w-[800px] text-center mx-auto mb-6 py-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="bg-gradient-to-r from-[#59ff83]/20 to-[#05c1dc]/20 border border-[#59ff83]/50 rounded-lg p-8"
                >
                  <div className="flex flex-col items-center gap-4">
                    <CheckCircle2 size={64} className="text-[#59ff83]" />
                    <h2 className="text-[#ffffff] text-3xl md:text-4xl font-bold">
                      Welcome to the $CHAMP Community!
                    </h2>
                    <p className="text-neutral-light-10 text-lg">
                      Your registration is complete. Now it&apos;s time to grow your referral network!
                    </p>
                  <button
                      onClick={handleNextToReferrals}
                      className="bg-[#59ff83] text-[#092a36] px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#4ae66b] transition-all duration-300"
                    >
                      Start Referring Friends
                  </button>
                  </div>
                </motion.div>
              </div>
            )
          ) : (
            /* Referral section - shown after form submission - updated layout with 2 columns */
            <div id="referral-section" className="w-full py-6">
              {/* CTA content for referral step */}
              <div className="w-full max-w-[800px] text-center mx-auto mb-6">
                <motion.h1 
                  className="font-bold text-[#ffffff] text-[38px] md:text-[60px] leading-tight md:leading-[1.2em] tracking-[-.01em] mt-0 max-w-[600px] mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  A real $CHAMP doesn&apos;t&nbsp;gatekeep.
                </motion.h1>

                <div className="flex flex-col gap-[12px] mt-4 items-center">
                  <motion.p 
                    className="text-neutral-light-10 text-xl md:text-2xl font-semibold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    Share your referral code. Earn more&nbsp;$CHAMP
                  </motion.p>
                </div>
              </div>

              {/* Two column layout for desktop */}
              <div className="w-full flex flex-col md:flex-row items-start justify-between gap-8">
                {/* Left column - referral info */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                  {/* User profile and referral code card combined */}
                  <div 
                    className="bg-[#0d192a] p-5 rounded-lg border border-[#00354d] hover:bg-[#0f1f32] transition-all duration-300 cursor-pointer"
                    onClick={handleCopyCode}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCopyCode();
                      }
                    }}
                  >
                    {/* User profile */}
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#00354d]">
                      <img 
                        src="https://i.postimg.cc/cJmK7qJP/champster-mascot.png"
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border border-[#59ff83]"
                      />
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">@champster_user</span>
                        <span className="text-neutral-mid-80 text-xs">{address ? address.substring(0, 6) + '...' + address.substring(address.length - 4) : '0x85a...b734'}</span>
                      </div>
                      
                      <ConnectButton.Custom>
                        {({
                          account,
                          chain,
                          openAccountModal,
                          openChainModal,
                          openConnectModal,
                          authenticationStatus,
                          mounted,
                        }) => {
                          const ready = mounted && authenticationStatus !== 'loading';
                          const connected =
                            ready &&
                            account &&
                            chain &&
                            (!authenticationStatus ||
                              authenticationStatus === 'authenticated');

                          return (
                            <div
                              {...(!ready && {
                                'aria-hidden': true,
                                'style': {
                                  opacity: 0,
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                                },
                              })}
                            >
                              {connected && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openAccountModal();
                                  }}
                                  className="ml-auto bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2 py-1 h-7 rounded-full text-xs flex items-center gap-1"
                                >
                                  <LogOut size={14} />
                                  <span>Disconnect</span>
                                </button>
                              )}
                            </div>
                          );
                        }}
                      </ConnectButton.Custom>
                    </div>
                    
                    {/* Referral code */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-neutral-light-10 text-sm">Your referral code:</span>
                        <span className="text-[#59ff83] text-2xl font-bold">
                          {userReferralCode || "loading..."}
                        </span>
                      </div>
                      <div className="text-[#59ff83]">
                        {codeCopied ? (
                          <div className="flex items-center gap-1">
                            <Check size={18} />
                            <span className="text-sm">Copied!</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Copy size={18} />
                            <span className="text-sm">Copy</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-neutral-light-10 text-sm mt-3 pt-3 border-t border-[#00354d]">
                      When users verify your code in the app, your cube will unlock new animations!
                    </div>
                  </div>
                  
                  {/* Display added referrals with profiles */}
                  {referredUsersList && referredUsersList.length > 0 && (
                    <div className="space-y-2">
                      {referredUsersList.map((referral, index) => (
                        <div key={index} className="bg-[#0d192a] p-3 rounded-lg border border-[#00354d]">
                          <div className="flex items-center gap-3">
                            <img 
                              src="https://i.postimg.cc/cJmK7qJP/champster-mascot.png"
                              alt="Profile" 
                              className="w-6 h-6 rounded-full border border-[#59ff83]"
                            />
                            <div className="flex flex-col">
                              <span className="text-white text-sm font-medium">{referral.referred_email}</span>
                              <span className="text-neutral-mid-80 text-xs">
                                {referral.referred_wallet ? 
                                  referral.referred_wallet.substring(0, 6) + '...' + referral.referred_wallet.substring(referral.referred_wallet.length - 4) : 
                                  'Wallet not connected'
                                }
                              </span>
                            </div>
                            <div className="ml-auto text-[#59ff83] text-xs">
                              {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} referral
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
          </div>

                {/* Right column - cube */}
                <div className="w-full md:w-1/2 flex flex-col items-center">
                  {/* 3D cube viewer */}
                  <div className="w-full h-[400px] relative touch-pan-y overflow-auto" ref={cubeContainerRef}>
                    {isRegistered && userReferralCode && referralStats ? (
              <ReferralCube 
                userReferralCode={userReferralCode} 
                referralStats={referralStats} 
                referredUsers={referredUsersList}
                neonEffectActive={showCubeNeonEffect}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <Image 
                          src="/Champster_LookingLeft.png"
                  alt="Champster awaiting your registration"
                          width={350}
                          height={350}
                  quality={100}
                          priority
                />
                <p className="mt-4 text-sm text-gray-300">Connect wallet & register to see your referral cube!</p>
              </div>
            )}
          </div>
        </div>
                    </div>
                  </div>
          )}
          </div>
          </div>
      
      

      {/* Success Animation Overlay - KEEPING YOUR EXISTING FUNCTIONALITY */}
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

      {/* Footer */}
      <footer className="relative z-10 w-full py-0 text-center text-white border-t border-white/10 mt-12">
        <p>&copy; {new Date().getFullYear()} Prospect Sports. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-4">
          <Link href="/terms" className="hover:text-[#4ae5fb]">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-[#4ae5fb]">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-[#4ae5fb]">Contact</Link>
        </div>
      </footer>
    </div>
  );
}

