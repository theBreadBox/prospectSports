"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ReferralsList } from './referral/ReferralsList';
import { MemeFaces } from './meme/MemeFaces';
import { MemeModal } from './meme/MemeModal';

// Simple User type to avoid Prisma import issues
interface User {
  id: string;
  email: string;
  wallet_address: string;
  twitter_username?: string | null;
  twitter_id?: string | null;
  access_token?: string | null;
  referral_code: string;
  referred_by?: string | null;
  created_at: Date;
  updated_at: Date;
}

interface ReferralStats {
  referred_users: Array<User>;
}

export default function ReferralTracker() {
  const { address, status } = useAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [userReferralCode, setUserReferralCode] = useState('');
  const [message, setMessage] = useState('');
  const [memeModalOpen, setMemeModalOpen] = useState(false);
  const [selectedMeme, setSelectedMeme] = useState({ url: '', alt: '' });
  const [memeFaces, setMemeFaces] = useState(
    Array.from({ length: 6 }, (_, i) => ({ id: i + 1, isUnlocked: false }))
  );

  // Rest of your existing code...

  const handleFaceClick = (faceNumber: number, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    
    setSelectedMeme({
      url: `https://i.postimg.cc/L40J9m7x/Meme-${faceNumber}-Revealed.png`,
      alt: `Meme ${faceNumber}`
    });
    setMemeModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0d192a] p-6 rounded-lg border border-[#00354d]">
        {/* Your existing referral stats code */}
      </div>
      
      <ReferralsList 
        referrals={referralStats?.referred_users.map(user => ({
          address: user.wallet_address,
          timestamp: user.created_at.getTime()
        })) || []}
        getOrdinalSuffix={(num: number) => {
          const j = num % 10;
          const k = num % 100;
          if (j === 1 && k !== 11) return 'st';
          if (j === 2 && k !== 12) return 'nd';
          if (j === 3 && k !== 13) return 'rd';
          return 'th';
        }}
      />
      
      <MemeFaces 
        memeFaces={memeFaces}
        onFaceClick={handleFaceClick}
      />
      
      <MemeModal 
        isOpen={memeModalOpen}
        onClose={() => setMemeModalOpen(false)}
        imageUrl={selectedMeme.url}
        alt={selectedMeme.alt}
      />
    </div>
  );
} 