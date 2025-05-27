import React from 'react';
import Image from 'next/image';

const DownloadButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
      <a 
        href="https://apps.apple.com/us/app/prospect-sports/id1618753462" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block"
        aria-label="Download on the App Store"
      >
        <Image 
          src="https://cdn.prod.website-files.com/62ffc292db8ee4c6c0ebfdfc/62ffc292db8ee45fcfebfeb8_Download_on_the_App_Store_Badge_US-UK_RGB_wht_092917.svg"
          alt="Download on the App Store" 
          width={119.66} 
          height={39.99}
          className="h-auto"
        />
      </a>
      <a 
        href="https://play.google.com/store/apps/details?id=io.prospectsports.android.app" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block"
        aria-label="Get it on Google Play"
      >
        <Image 
          src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
          alt="Get it on Google Play" 
          width={138} 
          height={40.63}
          className="h-auto"
        />
      </a>
    </div>
  );
};

export default DownloadButtons;