"use client";

import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { useState } from 'react';
import Image from "next/image";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import Feedback from "./Feedback";
import Navbar from '../components/Navbar';
import TwitterLoginComponent from '../components/twitterLogin';

export default function Home() {
  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
  
    try {
      // Use the Next.js API route
      const response = await fetch('/api/submitWallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: address }),
      });
  
      if (response.ok) {
        setMessage('Data successfully submitted!');
        setIsRegistered(true);
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
    <div className="relative grid grid-rows-[1fr_auto] min-h-screen pt-20 pb-20 sm:p-20 font-[family-name:var(--font-avenue-mono)] bg-gradient-to-b from-black to-[#013538] overflow-hidden">
      {/* Grids and aurora gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-[#00ff00] to-transparent opacity-15 blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#00ff00] to-transparent opacity-10 blur-3xl"></div>
    
      {/* Main content */}
      <main className="relative flex flex-col items-center justify-center z-10 text-white text-center min-h-screen pb-20">
        <div className="flex flex-row items-center justify-around gap-4 md:gap-8 w-full px-4 sm:px-0" style={{ maxWidth: '1200px' }}>
          <a
            href="https://prospectsports.xyz"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/proLogo.png"
              alt="Prospect logo"
              width={150}
              height={150}
              quality={100}
              priority
            />
          </a>
          
          <div className="flex justify-center">
            {status === "connected" ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm max-w-sm w-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
                      Wallet Connected
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{address}</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] flex-1"
                      onClick={() => disconnect()}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Disconnect
                    </button>
                    
                    {!isRegistered && status === 'connected' && (
                      <button
                        className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-[#4ae5fb] hover:text-black text-sm h-10 px-5 font-[family-name:var(--font-roobert)] flex-1"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Register for Presale'}
                      </button>
                    )}
                  </div>
                  {message && <p className="mt-2 text-sm">{message}</p>}
                </div>
              </div>
            ) : status === "reconnecting" || status === "connecting" ? (
              <div>
                <Image src="/champster.gif" alt="Loading" width={100} height={100} />
              </div>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="bg-transparent text-white border border-[#4ae5fb] rounded-lg px-4 py-2 transition-colors duration-300 hover:bg-gradient-to-r hover:from-[#4ae5fb] hover:to-red-500 hover:text-black hover:text-bold"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            )}
          </div>

          <Image
            src="/avax.svg"
            alt="avax logo"
            width={150}
            height={150}
            quality={100}
            priority
          />
        </div>
      </main>
      
    
    </div>
  );
}

function getRequestToken(): { oauth_token: string; oauth_token_secret: string; } | PromiseLike<{ oauth_token: string; oauth_token_secret: string; }> {
  throw new Error('Function not implemented.');
}

