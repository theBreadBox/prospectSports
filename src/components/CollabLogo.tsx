import React from "react";

export const CollabLogo: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center">
      {/* Mobile view */}
      <div className="block md:hidden">
        <img 
          src="https://i.postimg.cc/gknFPR6B/collab-logo.png" 
          alt="Prospect Sports x Avalanche" 
          className="w-auto h-[80px] object-contain transition-opacity"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      
      {/* Desktop view */}
      <div className="hidden md:block">
        <img 
          src="https://i.postimg.cc/gknFPR6B/collab-logo.png" 
          alt="Prospect Sports x Avalanche" 
          className="w-auto h-[80px] object-contain transition-opacity"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}; 