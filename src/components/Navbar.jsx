// src/components/Navbar.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-transparent text-white z-50 fixed top-5 left-20 w-full p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* Navigation Cube Link */}
          <Link 
            href="/navigate"
            className="mr-4 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            Explore 3D
          </Link>
        </div>
      
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
          
        </a>
      </div>
    </nav>
  );
};

export default Navbar;