// src/components/Navbar.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-transparent text-white z-50 fixed top-5 left-20 w-full p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
        <a
        href="https://prospectsports.io" // Replace with your desired URL
        target="_blank" // Opens the link in a new tab
        rel="noopener noreferrer" // Security best practice for external links
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          margin: '10px',
          zIndex: 1000, // Optional: Add some margin
        }}
      >
          <Image src="/topLogo.png" alt="Prospect Logo" width={200} height={200} />
    </a>
          
        </div>
      
      </div>
    </nav>
  );
};

export default Navbar;