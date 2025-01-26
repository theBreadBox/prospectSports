// src/components/Navbar.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/proLogo.png" alt="Prospect Logo" width={50} height={50} />
          <span className="ml-3 text-xl font-bold">Prospect Sports</span>
        </div>
        <ul className="flex space-x-4">
          <li>
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
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;