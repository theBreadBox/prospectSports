import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type SocialIconsProps = {
  variant?: 'header' | 'footer';
};

const SocialIcons = ({ variant = 'header' }: SocialIconsProps) => {
  return (
    <div className="flex items-center space-x-4">
      <a
        href="https://x.com/ProspectSportsX" 
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "text-center rounded-[1000px] justify-center items-center w-[36px] min-w-[36px] h-[36px] pl-0 flex overflow-hidden transition-[background-color_.35s,transform_.35s]",
          variant === 'header' 
            ? "hover:opacity-50" 
            : "bg-[#549BA1] hover:opacity-50"
        )}
        aria-label="Twitter"
      >
        <Image 
          src="https://cdn.prod.website-files.com/62ffc292db8ee4c6c0ebfdfc/6603536a8d682f15a83e1c0f_x-social-media-white-icon.png"
          alt="Twitter"
          width={20}
          height={20}
        />
      </a>
      <a
        href="https://t.me/prospect"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "text-center rounded-[1000px] justify-center items-center w-[36px] min-w-[36px] h-[36px] pl-0 flex overflow-hidden transition-[background-color_.35s,transform_.35s]",
          variant === 'header' 
            ? "hover:opacity-50" 
            : "bg-[#549BA1] hover:opacity-50"
        )}
        aria-label="Telegram"
      >
        <Image 
          src="https://cdn.prod.website-files.com/62ffc292db8ee4c6c0ebfdfc/62ffc292db8ee43068ebfe9f_telegram.svg"
          alt="Telegram"
          width={20}
          height={20}
        />
      </a>
    </div>
  );
};

export default SocialIcons;