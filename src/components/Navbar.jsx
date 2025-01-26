// src/components/Navbar.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-transparent text-white z-50 fixed top-5 left-20 w-full p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/topLogo.png" alt="Prospect Logo" width={200} height={200} />
          
        </div>
        <ul className="flex space-x-4">
          {/* <li>
            <Link href="/">
              <a className="hover:text-green-500">Home</a>
            </Link>
          </li>
          <li>
            <Link href="/about">
              <a className="hover:text-green-500">About</a>
            </Link>
          </li>
          <li>
            <Link href="/docs">
              <a className="hover:text-green-500">Docs</a>
            </Link>
          </li>
          <li>
            <Link href="/blog">
              <a className="hover:text-green-500">Blog</a>
            </Link>
          </li>
          <li>
            <Link href="/contact">
              <a className="hover:text-green-500">Contact</a>
            </Link>
          </li> */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;