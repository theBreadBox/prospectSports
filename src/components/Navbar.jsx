// src/components/Navbar.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import prospectLogo from '/public/assets/logo.svg'; // Import the logo

const Navbar = () => {
  return (
    <nav className="bg-transparent text-white z-50 fixed top-5 left-0 w-full px-5 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/" className="mr-6"> {/* Added margin-right for spacing */}
            <Image 
              src={prospectLogo} 
              alt="Prospect Logo" 
              width={100} // Adjust width as needed, SVG will scale
              height={100} // Adjust height as needed
              priority // Good for LCP elements like logos
            />
          </Link>
          
        </div>
      
        <a
          href="https://prospectsports.xyz" // Replace with your desired URL
          target="_blank" // Opens the link in a new tab
          rel="noopener noreferrer" // Security best practice for external links
          style={{
            position: 'absolute',
            top: 0,
            right: '20px', // Added some right padding for this link
            margin: '10px',
            zIndex: 1000, 
          }}
        >
          {/* Content for this link, if any, was missing. Add if needed. */}
        </a>
      </div>
    </nav>
  );
};

export default Navbar;