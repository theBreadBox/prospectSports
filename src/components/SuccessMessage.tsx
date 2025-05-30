import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SuccessMessageProps {
  onNextClick: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ onNextClick }) => {
  return (
    <motion.div 
      id="success-message" 
      className="w-full max-w-[720px] mx-auto p-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* Updated Champster image - smaller with less padding commenting for push */}
      <div className="mb-2 flex justify-center">
        <div className="flex items-center justify-center">
          <img 
            src="https://i.postimg.cc/J0WZx18N/WeBall.png" 
            alt="Champster Mascot" 
            className="w-[290px] h-auto object-contain"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
      
      <h2 className="text-[#59ff83] text-[45px] md:text-[66px] font-bold mb-2">You&apos;re Signed up! We&nbsp;Ball!</h2>
      
      <div className="flex flex-col gap-2 text-center mx-auto max-w-[480px]">
        <p className="text-neutral-light-10">Look for an email to complete enrollment in our $CHAMPSTER loyalty program</p>
        <p className="text-neutral-light-10">Complete each side of the cube to unlock new Champster memes and track your status.</p>
      </div>
      
      {/* Next Button */}
      <div className="mt-4 flex justify-center">
        <Button
          onClick={onNextClick}
          className="bg-[#59ff83] hover:bg-[#40d268] text-[#092a36] font-bold text-lg px-8 py-6 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105"
          aria-label="Continue to referral section"
        >
          <span>NEXT</span>
          <ArrowRight size={24} />
        </Button>
      </div>
    </motion.div>
  );
};