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
import { SplineViewer } from '@/components/SplineViewer';
import { HeroSection } from '../components/HeroSection';
import dynamic from 'next/dynamic';

// import Feedback from "./Feedback"; // Assuming this is not used or defined elsewhere
// import Navbar from '../components/Navbar'; // Assuming this is not used or defined elsewhere
import TwitterSignInButton from '../components/TwitterButton'; // Make sure this component exists

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
//coment for commit
export default function Home() {
  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // const [successMessage, setSuccessMessage] = useState(''); // Replaced by showSuccessMessage boolean
  const [isRegistered, setIsRegistered] = useState(false);
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [urlReferralCode, setUrlReferralCode] = useState(''); // Store URL referral code separately
  const [userReferralCode, setUserReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referredUsersList, setReferredUsersList] = useState<ReferredUser[]>([]);
  // const [showSignupFlow, setShowSignupFlow] = useState(false); // Seems unused, can be removed if not needed
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
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false); // This controls the success message UI
  const [showReferralSteps, setShowReferralSteps] = useState<boolean>(false);
  const [lastUnlockedFace, setLastUnlockedFace] = useState<number>(0);
  const [selectedReferralCount, setSelectedReferralCount] = useState<number | null>(null);

  // New state for Twitter data
  const [twitterData, setTwitterData] = useState<{username: string, id: string} | null>(null);

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
      const fromCommunity = urlParams.get('from');
      
      if (refCode) {
        setUrlReferralCode(refCode); // Store the URL referral code
        setReferralCode(refCode); // Set it as the current referral code
      }
      
      if (fromCommunity === 'community') {
        setMessage('Please complete registration to access the community page.');
        // Clean up the parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('from');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

  // Handle Twitter OAuth callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const twitterSuccess = urlParams.get('twitter_success');
      const twitterUsername = urlParams.get('twitter_username');
      const twitterId = urlParams.get('twitter_id');
      const error = urlParams.get('error');

      if (error) {
        setMessage(`Twitter authentication failed: ${error}`);
        return;
      }

      if (twitterSuccess === 'true' && twitterUsername && twitterId) {
        // Store Twitter data temporarily
        setTwitterData({ username: twitterUsername, id: twitterId });
        
        // Mark Twitter step as completed
        if (!completedSteps.includes(3)) {
          setCompletedSteps(prev => [...prev, 3]);
        }
        
        // Move to referral step if we're currently on Twitter step
        if (activeStep === 3) {
          setActiveStep(4);
        }
        
        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('twitter_success');
        newUrl.searchParams.delete('twitter_username');
        newUrl.searchParams.delete('twitter_id');
        newUrl.searchParams.delete('error');
        window.history.replaceState({}, '', newUrl.toString());
        
        setMessage('Twitter account connected successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  }, [activeStep, completedSteps]);

  // Get window size for confetti
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
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
      // Only advance to step 2 if not already past it and not already registered and showing referral steps
      if (activeStep < 2 && !isFormComplete) {
        setActiveStep(2);
      }
      if (!completedSteps.includes(1)) {
        setCompletedSteps(prev => [...prev, 1]);
      }
    } else if (status === 'disconnected') {
        // Reset form if wallet disconnects
        setActiveStep(1);
        setCompletedSteps([]);
        setEmail('');
        setReferralCode(urlReferralCode); // Preserve URL referral code instead of clearing
        setEmailError('');
        setIsFormValid(false);
        setIsFormComplete(false);
        setShowReferralSteps(false);
        setShowSuccessMessage(false);
        // setIsRegistered(false); // Keep isRegistered based on API check if needed for "already registered" messages
    }
  }, [status, activeStep, isFormComplete]);

  // Check if user is already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (address && status === 'connected') {
        setLoading(true); // Show loading while checking registration
        try {
          const response = await fetch(`/api/referrals?wallet=${address}`);
          if (response.ok) {
            const data = await response.json();
            setIsRegistered(true);
            setUserReferralCode(data.stats.referral_code);
            setReferralStats(data.stats);
            setReferredUsersList(data.referred_users || []);
            setEmail(data.stats.email || ''); // Pre-fill email if found
            
            // If user is already registered, show referral section directly
            setIsFormComplete(true);
            setShowReferralSteps(true);
            setCompletedSteps([1, 2, 3, 4]); // Mark all initial steps as complete
            setActiveStep(5); // Move to a "post-registration" step, e.g., referral display
            setMessage(''); // Clear any previous messages
            
            // Automatically scroll to referral section after a brief delay
            setTimeout(() => {
              const referralSection = document.getElementById('referral-section');
              if (referralSection) {
                referralSection.scrollIntoView({ behavior: 'smooth' });
              }
            }, 300);
            
          } else {
            // User not registered, reset relevant states if they were previously set
            setIsRegistered(false);
            setIsFormComplete(false);
            setShowReferralSteps(false);
            setUserReferralCode('');
            setReferralStats(null);
            setReferredUsersList([]);
            // Preserve URL referral code when resetting
            if (urlReferralCode && !referralCode) {
              setReferralCode(urlReferralCode);
            }
            // If wallet is connected but user not registered, ensure form starts at email step
            if (activeStep < 2) {
                setActiveStep(2);
            }
          }
        } catch (error) {
          console.error('Error checking registration:', error);
          setIsRegistered(false);
          setIsFormComplete(false);
          setShowReferralSteps(false);
          // Potentially set activeStep to 2 if registration check fails but wallet is connected
           if (activeStep < 2 && status === 'connected') {
              setActiveStep(2);
           }
        } finally {
          setLoading(false); // Clear loading state
        }
      } else if (status === 'disconnected') {
        // Reset all states when wallet is disconnected
        setIsRegistered(false);
        setIsFormComplete(false);
        setShowReferralSteps(false);
        setUserReferralCode('');
        setReferralStats(null);
        setReferredUsersList([]);
        setActiveStep(1);
        setCompletedSteps([]);
        setEmail('');
        setReferralCode(urlReferralCode); // Preserve URL referral code
        setEmailError('');
        setIsFormValid(false);
        setShowSuccessMessage(false);
        setMessage('');
      }
    };

    checkRegistration();
  }, [address, status]); // Rerun when address or status changes

  // Progress steps - 4 steps as shown in Community.tsx
  const progressSteps = [
    { id: 1, active: completedSteps.includes(1), label: "Connect Wallet" },
    { id: 2, active: completedSteps.includes(2), label: "Enter Email" },
    { id: 3, active: completedSteps.includes(3), label: "Sign-in with X" },
    { id: 4, active: completedSteps.includes(4), label: "Referral Code" }
  ];

  // Referral steps - 6 steps for tracking referrals
  const referralSteps = [
    { id: 1, active: (referredUsersList?.length || 0) >= 1, label: "Ref 1" },
    { id: 2, active: (referredUsersList?.length || 0) >= 2, label: "Ref 2" },
    { id: 3, active: (referredUsersList?.length || 0) >= 3, label: "Ref 3" },
    { id: 4, active: (referredUsersList?.length || 0) >= 4, label: "Ref 4" },
    { id: 5, active: (referredUsersList?.length || 0) >= 5, label: "Ref 5" },
    { id: 6, active: (referredUsersList?.length || 0) >= 6, label: "Ref 6" }
  ];

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Navigate to a specific step
  const navigateToStep = (step: number) => {
    // Allow navigation only to completed steps or the current active step,
    // and not beyond the current active step unless it's already completed.
    if (completedSteps.includes(step) || step === activeStep) {
        if (step <= 4) { // Max 4 registration steps
            setActiveStep(step);
        }
    } else if (step < activeStep && step <= 4) { // Allow going back to previous steps
        setActiveStep(step);
    }
  };

  // Handle input change
  const handleInputChange = (value: string, field: 'email' | 'referralCode') => {
    if (field === 'email') {
      setEmail(value);
      setEmailError(""); // Clear error on type
      // Validate form on input change for email to enable/disable Next/Register button
      setIsFormValid(isValidEmail(value));
    } else if (field === 'referralCode') {
      setReferralCode(value);
    }
  };

  // Handle email blur
  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      setIsFormValid(false);
    } else if (isValidEmail(email)) {
      setEmailError("");
      if (!completedSteps.includes(2)) {
        setCompletedSteps(prev => [...prev, 2]);
      }
      setActiveStep(3); // Move to Twitter step
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
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
      setCompletedSteps(prev => [...prev, 4]);
    }
    // Proceed to submit the form with no referral code
    handleSubmit(undefined, true); // Pass a flag to indicate referral skip
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent, isSkippingReferral = false) => {
    if (e) e.preventDefault();
    
    if (activeStep === 2 && !isValidEmail(email)) { // If current step is email, validate it
      setEmailError("Please enter a valid email address");
      setIsFormValid(false);
      return;
    }
   
    if (!address || status !== 'connected') {
      console.error("Wallet not connected for form submission");
      setMessage("Please connect your wallet first.");
      return;
    }

    // If on referral step (4) or skipping referral, then proceed to actual submission
    if (activeStep === 4 || isSkippingReferral) {
        setLoading(true);
        setMessage(''); // Clear previous messages
        setEmailError(''); // Clear previous email errors specifically
    
        try {
          const response = await fetch('/api/submitWallet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              wallet_address: address, 
              email, // Email should be valid by this point if activeStep was 2
              referred_by: isSkippingReferral ? undefined : referralCode || undefined,
              twitter_id: twitterData?.id,
              twitter_username: twitterData?.username
            }),
          });
    
          if (response.ok) {
            const data = await response.json();
            // setMessage("Look for an email to complete enrollment in our $CHAMPSTER loyalty program"); // Use new success message UI
            setIsRegistered(true);
            setUserReferralCode(data.referral_code);
            setReferralStats(prev => ({...prev, referral_code: data.referral_code, email: email, wallet_address: address } as ReferralStats)); // Update local stats
            
            if (!completedSteps.includes(4)) {
              setCompletedSteps(prev => [...prev, 4]);
            }
            
            setShowSuccessMessage(true); // Show the new success message component
            setShowSuccessAnimation(true); // Trigger confetti/image animation
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
            // setEmailError(errorData.error || 'Failed to submit data. Please try again.'); // More general message area
          }
        } catch (error: unknown) {
          console.error('Error submitting data:', error);
          const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
          setMessage(errorMessage);
          // setEmailError(errorMessage);
        } finally {
          setLoading(false);
        }
    } else if (activeStep === 2 && isValidEmail(email)) { // If on email step and email is valid, move to next
        handleEmailBlur(); // This will advance step and mark as complete
    }
  };

  // Move to the referral step from success message
  const handleNextToReferrals = () => {
    setShowSuccessMessage(false); // Hide the success message component
    setIsFormComplete(true); // Mark the overall form as complete
    setShowReferralSteps(true); // Show the referral tracking section
    setActiveStep(5); // Arbitrary step number for "referral display" phase
    
    // Fetch updated referral stats if needed, or rely on existing state
    // This is a good place to ensure referralStats and referredUsersList are up-to-date
    const fetchReferralData = async () => {
        if(address) {
            try {
                const response = await fetch(`/api/referrals?wallet=${address}`);
                if (response.ok) {
                    const data = await response.json();
                    setReferralStats(data.stats);
                    setReferredUsersList(data.referred_users || []);
                }
            } catch (error) {
                console.error("Error fetching referral data after completion:", error);
            }
        }
    };
    fetchReferralData();

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
        if (isValidEmail(email)) {
          handleEmailBlur(); // Advances step and validates
        } else {
          setEmailError("Please enter a valid email address");
          setIsFormValid(false);
        }
      } else if (field === 'referralCode') {
        // For referral code, Enter should attempt to submit the form
        handleSubmit();
      }
    }
  };
  
  const currentSubmitButtonText = () => {
    if (loading) return "REGISTERING...";
    if (activeStep === 2 && status === 'connected') return "NEXT"; // Email step
    // if (activeStep === 3 && status === 'connected') return "NEXT"; // Twitter step (if distinct)
    if (activeStep === 4 && status === 'connected') return "REGISTER"; // Referral code / final step
    return "REGISTER"; // Default
  };

  const handleAddReferral = async (email: string) => {
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('/api/referrals/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referrerWallet: address,
          referredEmail: email,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setReferredUsersList(prev => [...prev, { referred_email: email, referred_wallet: '' }]);
        setMessage('Referral added successfully!');
        // Update referral stats if needed
        if (referralStats) {
          setReferralStats({
            ...referralStats,
            total_referred: (referralStats.total_referred || 0) + 1
          });
        }
      } else {
        setMessage('Failed to add referral. Please try again.');
      }
    } catch (error) {
      console.error('Error adding referral:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const handleResetForm = () => {
      setActiveStep(1);
      setCompletedSteps([]);
      setEmail('');
      setReferralCode(urlReferralCode); // Preserve URL referral code instead of clearing
      setEmailError('');
      setIsFormValid(false);
      setIsFormComplete(false);
      setShowReferralSteps(false);
      setShowSuccessMessage(false);
    };

    window.addEventListener('resetForm', handleResetForm);
    
    return () => {
      window.removeEventListener('resetForm', handleResetForm);
    };
  }, []);

  useEffect(() => {
    const handleUserRegistered = (event: CustomEvent) => {
      setIsRegistered(true);
      setIsFormComplete(true);
      setShowReferralSteps(true);
      setActiveStep(5);
      
      // Fetch referral data
      const fetchReferralData = async () => {
        if(event.detail.address) {
          try {
            const response = await fetch(`/api/referrals?wallet=${event.detail.address}`);
            if (response.ok) {
              const data = await response.json();
              setReferralStats(data.stats);
              setReferredUsersList(data.referred_users || []);
            }
          } catch (error) {
            console.error("Error fetching referral data:", error);
          }
        }
      };
      fetchReferralData();
    };

    window.addEventListener('userRegistered', handleUserRegistered as EventListener);
    return () => {
      window.removeEventListener('userRegistered', handleUserRegistered as EventListener);
    };
  }, []);

  return (
    <div className="bg-[#001118] flex flex-col justify-center items-center w-full py-4">
      {/* Sticky Progress Bar */}
      <div className="sticky top-0 z-50 w-full bg-[#001118]">
        <div className="w-full max-w-[1080px] mx-auto px-4 py-6">
          {!showReferralSteps ? (
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
                      STEP {step.id} {step.active && <CheckCircle2 size={14} className="text-[#4AE5FB]" />}
                    </div>
                    <div className="text-xs mt-0.5 text-white hidden md:block">
                      {step.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                    {step.active && <CheckCircle2 size={14} className="text-[#4AE5FB]" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

      <div className="bg-[#001118] w-full max-w-[1080px] px-4 md:px-8 lg:px-12">
        <div className="flex flex-col w-full items-center relative">
          {!isFormComplete ? (
            !showSuccessMessage ? (
              <div className="flex flex-col md:flex-row items-start justify-between gap-8 scroll-mt-0">
                <div className="w-full md:w-1/2 flex flex-col gap-4 mt-0">
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
                      className="text-[#4AE5FB] text-base md:text-lg font-semibold"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      Sign-up for the upcoming $CHAMP token&nbsp;whitelist.
                    </motion.p>
                    <motion.p 
                      className="text-neutral-light-10 text-base md:text-lg" // Assuming neutral-light-10 is a defined color
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      PLUS download the app and refer your friends to secure your allocation and qualify for the&nbsp;airdrop.
                    </motion.p>
                </div>
                
                  <div className="w-full max-w-[375px] flex flex-col gap-5 mt-6">
                    {status !== "connected" ? (
                      <div className="w-full border-none"> {/* Assuming Card is not used here */}
                        <div className="relative w-full h-36 bg-[url(/intersect.svg)] bg-cover bg-no-repeat">
                          <div className="absolute w-full top-[37px] left-0 right-0 font-normal text-[#4AE5FB] text-xl text-center leading-[35px]">
                            Connect your wallet to start<br />
                            registration process!
                          </div>
                        </div>
                        <div className="flex flex-col items-center mt-4">
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-[#4AE5FB] text-sm">An EVM Compatible Wallet is Required</span>
                            <div className="group relative">
                              <span className="cursor-help text-[#4AE5FB]">ⓘ</span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0d192a] text-sm text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap border border-[#00354d]">
                                Ethereum Virtual Machine (EVM)
                              </div>
                            </div>
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
                                    style: {
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
                                          className="flex items-center justify-center h-[45px] rounded-[80px] transition-all duration-300 bg-[#4AE5FB] hover:text-white text-[#092a36] px-6"
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

                                    if (chain?.unsupported) {
                                      return (
                                        <button onClick={openChainModal} type="button" className="bg-red-500 text-white p-2 rounded-md">
                                          Wrong network
                                        </button>
                                      );
                                    }

                                    return (
                                      <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                          onClick={openAccountModal}
                                          type="button"
                                          className="flex items-center justify-center h-[40px] rounded-[80px] transition-all duration-300 bg-[#4AE5FB] hover:text-white text-[#092a36] px-2"
                                          onMouseEnter={() => setIsWalletHovered(true)}
                                          onMouseLeave={() => setIsWalletHovered(false)}
                                        >
                                          <div className="flex items-center gap-1">
                                            {isWalletHovered ? <LogOut size={18} /> : <Wallet size={18} />}
                                            <span className="font-semibold text-center tracking-[1px] text-xs whitespace-nowrap">
                                              {account?.displayName ? account.displayName.substring(0,6) + '...' : 'Account'}
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
                          
                          <div className="text-[#4AE5FB] text-sm mt-4">
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
                        {/* MODIFIED: Email field now only shows if activeStep is 2 */}
                        {status === "connected" && !isRegistered && activeStep === 2 && (
                          <div className="w-full relative h-[70px]"> {/* Ensure height accommodates error message */}
                            <div className="w-full absolute top-0 left-0 transition-all duration-300 opacity-100 z-10">
                              <div className="relative w-full h-[46px] bg-neutraldark-900 rounded-[10px] overflow-hidden border border-solid border-[#00354d]">
                                <input
                                  type="email" // Use type="email" for better semantics and mobile keyboards
                                  id="email"
                                  name="email"
                                  value={email}
                                  onChange={(e) => handleInputChange(e.target.value, 'email')}
                                  onKeyDown={(e) => handleKeyPress(e, "email")}
                                  onBlur={handleEmailBlur}
                                  placeholder="Enter your email"
                                  className="h-full w-full bg-transparent border-none text-neutral-mid-80 placeholder-neutral-mid-80 px-4" // Assuming these neutral colors are defined
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

                        {/* Twitter Sign In - Step 3 */}
                        {status === "connected" && !isRegistered && activeStep === 3 && (
                          <div className="w-full">
                            {twitterData ? (
                              <div className="w-full p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center">
                                ✓ Connected as @{twitterData.username}
                              </div>
                            ) : (
                              <TwitterSignInButton onSuccess={() => {
                                if (!completedSteps.includes(3)) {
                                  setCompletedSteps(prev => [...prev, 3]);
                                }
                                setActiveStep(4);
                              }} />
                            )}
                            <button 
                              type="button"
                              className="w-full mt-2 bg-transparent border border-[#00354d] hover:bg-[#001118]/50 text-[#4AE5FB] h-10 rounded-lg text-sm"
                              onClick={() => {
                                if (!completedSteps.includes(3)) {
                                  setCompletedSteps(prev => [...prev, 3]);
                                }
                                setActiveStep(4); // Move to referral step
                                // setIsFormValid(isValidEmail(email)); // Re-check form validity if needed, email should be valid by now
                              }}
                            >
                              {twitterData ? 'Continue' : "Don't have Twitter? Skip"}
                            </button>
                          </div>
                        )}
                
                        {/* Referral Code - Step 4 */}
                        {status === "connected" && !isRegistered && activeStep === 4 && (
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
                              <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 bg-transparent hover:bg-[#001118]/50 text-[#4AE5FB] text-sm rounded-md"
                                onClick={handleSkipReferral}
                              >
                                Skip
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Message area for general form messages or errors */}
                        {message && (
                            <div className={`text-sm mt-1 ${message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') ? 'text-[#ff394a]' : 'text-[#4AE5FB]'}`}>
                                {message}
                            </div>
                        )}

                        {/* Loading state when checking registration */}
                        {loading && status === 'connected' && !isRegistered && activeStep === 2 && !email && (
                          <div className="text-[#4AE5FB] text-sm">
                            Checking registration status...
                          </div>
                        )}

                        {/* Wallet connection and submit button */}
                        {status === "connected" && !isRegistered && (activeStep === 2 || activeStep === 3 || activeStep === 4) && (
                          <div className="flex w-full gap-2 items-center">
                            <ConnectButton.Custom>
                              {({
                                account,
                                chain,
                                openAccountModal,
                              }) => {
                                const ready = account && chain;
                                return (
                                  <div
                                    {...(!ready && {
                                      'aria-hidden': true,
                                      style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                                    })}
                                  >
                                    {ready && (
                                      <button
                                        type="button"
                                        className={`flex items-center justify-center h-[40px] rounded-[80px] transition-all duration-300 ${
                                          isWalletHovered 
                                            ? "bg-red-500 text-white px-2" 
                                            : "bg-[#4AE5FB] hover:text-white text-[#092a36] px-2"
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
                              type="submit" // Submit button will now trigger handleSubmit
                              form="signup-form"
                              disabled={activeStep === 2 ? !isFormValid || loading : loading} // Email step requires valid email
                              className={`flex-1 h-[40px] rounded-[80px] shadow-elevation-1 transition-all duration-300 ${
                                (activeStep === 2 ? isFormValid : true) && !loading ? "opacity-100 bg-[#05C1DC]" : "opacity-50 bg-[#05C1DC]"
                              }`}
                            >
                              <span className="text-white font-semibold text-center tracking-[1px] text-xs whitespace-nowrap">
                                {currentSubmitButtonText()}
                              </span>
                            </button>
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col w-full md:w-1/2 items-center" id="registration-form">
                  <div className="w-full h-[400px] relative touch-pan-y overflow-auto" ref={cubeContainerRef}>
                    {lastUnlockedFace === 0 && selectedReferralCount === null ? (
                      <video
                        ref={videoRef}
                        src="https://kalapa.agency/prospects_animated_cube.webm"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full relative overflow-visible z-10">
                        <SplineViewer
                          referralCode={userReferralCode}
                          referralCount={referredUsersList?.length || 0}
                          onAnimationComplete={() => setShowCubeNeonEffect(true)}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Referral input form - Only show after success message and first 4 steps */}
                  {showReferralSteps && completedSteps.length >= 4 && (
                    <div className="relative w-full mt-4">
                      <input
                        type="text"
                        placeholder="Enter referral email"
                        className="w-full h-[46px] bg-neutraldark-900 rounded-[10px] border border-solid border-[#00354d] text-neutral-mid-80 pl-4 pr-16"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddReferral(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 bg-[#59ff83] text-[#092a36] rounded-full text-sm"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Enter referral email"]') as HTMLInputElement;
                          if (input) {
                            handleAddReferral(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Success Message Component
              <div className="w-full max-w-[800px] text-center mx-auto mb-6 py-12 mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="bg-gradient-to-r from-[#4AE5FB]/20 to-[#05c1dc]/20 border border-[#4AE5FB]/50 rounded-lg p-8"
                >
                  <div className="flex flex-col items-center gap-4">
                    <CheckCircle2 size={64} className="text-[#4AE5FB]" />
                    <h2 className="text-[#ffffff] text-3xl md:text-4xl font-bold">
                      Welcome to the $CHAMP Community!
                    </h2>
                    <p className="text-neutral-light-10 text-lg">
                      Your registration is complete. Now it&apos;s time to grow your referral network!
                    </p>
                    <button
                      onClick={handleNextToReferrals}
                      className="bg-[#4AE5FB] text-[#092a36] px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#3ccde0] transition-all duration-300"
                    >
                      Start Referring Friends
                    </button>
                  </div>
                </motion.div>
              </div>
            )
          ) : (
            // Referral section
            <div id="referral-section" className="w-full py-6">
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

              <div className="w-full flex flex-col md:flex-row items-start justify-between gap-8 scroll-mt-0">
                <div className="w-full md:w-1/2 flex flex-col gap-4 mt-0">
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
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#00354d]">
                      <Image 
                        src="https://i.postimg.cc/cJmK7qJP/champster-mascot.png" // Placeholder, update if dynamic
                        alt="Profile" 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border border-[#4AE5FB]"
                      />
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">@{referralStats?.email.split('@')[0] || "champster_user"}</span>
                        <span className="text-neutral-mid-80 text-xs">{address ? address.substring(0, 6) + '...' + address.substring(address.length - 4) : '0x85a...b734'}</span>
                      </div>
                      
                      <ConnectButton.Custom>
                        {({
                          account,
                          chain,
                          openAccountModal,
                        }) => {
                           const ready = account && chain;
                          return (
                            <div
                              {...(!ready && {
                                'aria-hidden': true,
                                style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                              })}
                            >
                              {ready && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
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
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-neutral-light-10 text-sm">Your referral code:</span>
                        <span className="text-[#4AE5FB] text-lg md:text-xl font-bold break-all">
                          {userReferralCode || "loading..."}
                        </span>
                      </div>
                      <div className="text-[#4AE5FB]">
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
                  
                  {referredUsersList && referredUsersList.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-white text-lg font-semibold mb-2">Your Referrals ({referredUsersList.length}/6):</h3>
                      {referredUsersList.map((referral, index) => (
                        <div key={index} className="bg-[#0d192a] p-3 rounded-lg border border-[#00354d]">
                          <div className="flex items-center gap-3">
                            <Image 
                              src="https://i.postimg.cc/cJmK7qJP/champster-mascot.png" // Placeholder
                              alt="Referred User" 
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full border border-[#4AE5FB]"
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
                            <div className="ml-auto text-[#4AE5FB] text-xs">
                              {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} referral
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  { (!referredUsersList || referredUsersList.length === 0) && (
                     <p className="text-neutral-mid-80 text-sm">You haven&apos;t referred anyone yet. Share your code!</p>
                  )}
                </div>

                <div className="w-full md:w-1/2 flex flex-col items-center">
                  <div className="w-full h-[400px] relative touch-pan-y overflow-auto" ref={cubeContainerRef}>
                    {isRegistered && userReferralCode && referralStats ? (
                      <div className="w-full h-full relative overflow-visible z-10">
                        <SplineViewer
                          referralCode={userReferralCode}
                          referralCount={referredUsersList?.length || 0}
                          onAnimationComplete={() => setShowCubeNeonEffect(true)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <Image 
                          src="/Champster_LookingLeft.png" // Ensure this image is in your /public folder
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
      
      {showSuccessAnimation && typeof window !== 'undefined' && (
        <div 
          className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[100] transition-opacity duration-500 ease-in-out opacity-100 overflow-hidden"
          onClick={() => setShowSuccessAnimation(false)} // Allow dismissing by clicking overlay
        >
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="animate-popOutCustom"> {/* Ensure this animation is defined in your global CSS */}
              <Image 
                src="/Champster_SuperExcited.png" // Ensure this image is in your /public folder
                alt="Successfully Registered!"
                width={400}
                height={400}
                quality={100}
                className="object-contain w-full h-full"
              />
            </div>
          </div>
          <h2 className="absolute bottom-10 left-1/2 -translate-x-1/2 text-4xl font-bold text-white animate-fadeInDelayCustom z-10"> {/* Ensure this animation is defined */}
            You&rsquo;re Signed up! We Ball!
          </h2>
        </div>
      )}

      {/* Hero Banner moved to bottom of the page */}
      <div className="w-full mt-6 mb-6 max-w-[1080px] mx-auto" ref={heroRef}>
        <HeroSection />
      </div>
    </div>
  );
}
