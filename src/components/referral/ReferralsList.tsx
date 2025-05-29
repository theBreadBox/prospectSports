interface Referral {
  address: string;
  timestamp: number;
}

interface ReferralsListProps {
  referrals: Referral[];
  getOrdinalSuffix: (num: number) => string;
}

export const ReferralsList = ({ referrals, getOrdinalSuffix }: ReferralsListProps) => {
  if (!referrals.length) {
    return (
      <div className="text-center text-gray-400 py-4">
        No referrals yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {referrals.map((referral, index) => (
        <div 
          key={referral.address}
          className="bg-[#0d192a] p-4 rounded-lg border border-[#00354d]"
        >
          <p className="text-sm">
            {index + 1}{getOrdinalSuffix(index + 1)} referral: {referral.address}
          </p>
        </div>
      ))}
    </div>
  );
}; 