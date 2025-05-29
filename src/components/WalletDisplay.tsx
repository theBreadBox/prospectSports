"use client";

import { useAccount } from 'wagmi';

export default function WalletDisplay() {
  const { address } = useAccount();

  if (!address) return null;

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="absolute top-4 left-4 z-50 bg-[#0d192a] px-3 py-2 rounded-full border border-[#00354d] text-xs text-[#4AE5FB]">
      {truncatedAddress}
    </div>
  );
} 