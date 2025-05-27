import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SocialIcons from '@/components/SocialIcons';

const Footer = () => {
  return (
    <footer className="footer bg-[#001118] pt-[56px] pb-[32px] border-t border-[#ffffff1a]">
      <div className="container-default max-w-[1250px] mx-auto px-[24px] border-t border-[#ffffff1a]">
        <div className="flex flex-col md:flex-row justify-between items-center mt-10 mb-6">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <Image 
                src="https://cdn.prod.website-files.com/62ffc292db8ee4c6c0ebfdfc/62ffc292db8ee4805aebfe85_prospect-gaming-logo-full.svg"
                alt="Prospect"
                width={200}
                height={40}
                className="h-auto"
                priority
              />
            </Link>
          </div>
          
          <SocialIcons variant="footer" />
        </div>
        
        <div className="flex flex-col-reverse md:flex-row justify-between items-center mt-8">
          <p className="text-white text-xs mt-4 md:mt-0 text-center md:text-left">
            COPYRIGHT © PROSPECT LABS | DESIGNED BY{' '}
            <a 
              href="https://kalapa.studio/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#4AAEB5] hover:underline"
            >
              KALAPA DESIGN STUDIO
            </a>
          </p>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Link 
              href="https://www.prospectsports.xyz/legal" 
              className="text-white hover:text-[#4AAEB5] transition-colors text-[14px] tracking-[.1em] uppercase"
            >
              LEGAL
            </Link>
            <Link 
              href="https://www.prospectsports.xyz/legal/privacy-policy" 
              className="text-white hover:text-[#4AAEB5] transition-colors text-[14px] tracking-[.1em] uppercase"
            >
              PRIVACY POLICY
            </Link>
            <Link 
              href="https://www.prospectsports.xyz/legal/terms-and-conditions" 
              className="text-white hover:text-[#4AAEB5] transition-colors text-[14px] tracking-[.1em] uppercase"
            >
              TERMS & CONDITIONS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;