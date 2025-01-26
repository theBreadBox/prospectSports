"use client";
import { useState } from 'react';
import Image from "next/image";
import {
  useLoginWithAbstract,
  useWriteContractSponsored,
} from "@abstract-foundation/agw-react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { getGeneralPaymasterInput } from "viem/zksync";
import { parseAbi } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import Explore from "./Explore";
import Feedback from "./Feedback";
import Navbar from '../components/Navbar';

export default function Home() {
  const { logout } = useLoginWithAbstract();
  const { address, status } = useAccount();
  const { writeContractSponsored, data: transactionHash } =
    useWriteContractSponsored();
  const { data: transactionReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
  
    try {
      const response = await fetch('https://prospectsports.onrender.com/submitWallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }), // Ensure the key matches your backend expectation
      });
  
      if (response.ok) {
        setMessage('Data successfully submitted!');
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
      <Navbar />
      
      {/* Main content */}
      <main className="relative flex flex-col items-center justify-center z-10 text-white text-center min-h-screen pb-20">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/proLogo.png"
              alt="Prospect logo"
              width={200}
              height={200}
              quality={100}
              priority
            />
            <span>🤝</span>
            <Image
              src="/abstract.svg"
              alt="Abstract logo"
              width={200}
              height={30}
              quality={100}
              priority
            />
          </div>

          {/* Connect button and info */}
          <div className="flex justify-center">
            {status === "connected" ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm max-w-sm w-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
                      Connected to Abstract Global Wallet
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{address}</p>
                    <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
                      <a
                        href={`https://explorer.testnet.abs.xyz/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Explorer
                      </a>
                    </p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] flex-1"
                      onClick={logout}
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
                    
                    {status === 'connected' && (
                    <button
                    className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-[#4ae5fb] hover:text-black text-sm h-10 px-5 font-[family-name:var(--font-roobert)] flex-1"
                      onClick={handleSubmit}
                      disabled={loading}
                      
                    >
                      {loading ? 'Submitting...' : 'Register for Presale'}
                    </button>
                  )}
                  {message && <p>{message}</p>}

                  </div>
                  {!!transactionReceipt && (
                    <a
                      href={`https://explorer.testnet.abs.xyz/tx/${transactionReceipt?.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
                        Transaction Status: {transactionReceipt?.status}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {transactionReceipt?.transactionHash?.slice(0, 8)}...
                        {transactionReceipt?.transactionHash?.slice(-6)}
                      </p>
                    </a>
                  )}
                </div>
              </div>
            ) : status === "reconnecting" || status === "connecting" ? (
              <div className="animate-spin">
                <Image src="/abs.svg" alt="Loading" width={24} height={24} />
              </div>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="bg-transparent text-white border border-[#4ae5fb] rounded-lg px-4 py-2 transition-colors duration-300 hover:bg-green-500"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            )}
          </div>

        </div>
      </main>
      
     {/* Feedback section */}
     <section className="min-h-screen flex items-center justify-center">
     {status === 'connected' && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
          >
            {loading ? 'Submitting...' : 'Sign Up for Whitelist'}
          </button>
        )}
        {message && <p>{message}</p>}
        {/* <Feedback /> */}
      </section>

      {/* Explore section
      <section className="min-h-screen flex items-center justify-center">
        <Explore />
      </section> */}
    </div>

    

  );
}
