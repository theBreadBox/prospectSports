import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <div className="w-full relative flex items-end justify-center bg-[#001118] z-10 mt-0">
      {/* Mobile view */}
      <div className="block md:hidden w-full">
        <div className="relative w-full max-w-[375px] mx-auto">
          <img 
            src="https://i.postimg.cc/gknFPR6B/collab-logo.png" 
            alt="Prospect Sports x Avalanche" 
            className="w-auto h-[120px] max-w-[360px] mx-auto object-contain"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
      
      {/* Desktop view */}
      <div className="hidden md:block w-full">
        <div className="relative w-full max-w-[1080px] mx-auto">
          <img 
            src="https://i.postimg.cc/gknFPR6B/collab-logo.png" 
            alt="Prospect Sports x Avalanche" 
            className="w-auto h-[120px] max-w-[480px] mx-auto object-contain"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  );
}; 