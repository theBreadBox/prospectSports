"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import NavLink from '@/components/NavLink';
import SocialIcons from '@/components/SocialIcons';
import DownloadButtons from '@/components/DownloadButtons';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleMenu = () => setIsOpen(!isOpen);
  
  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <header
      className={cn(
        "fixed inset-0 bottom-auto w-full z-[99] transition-all duration-300",
        "backdrop-blur-[5px] -webkit-backdrop-filter-blur-[5px]",
        "border-0 border-b border-[#ffffff1a] py-[33px]",
        isScrolled ? "bg-[#001118f2]" : "bg-[#001118f2]"
      )}
    >
      <div className="container-default max-w-[1250px] mx-auto px-[24px] flex items-center justify-between">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between flex-grow ml-12">
          <nav className="flex items-center space-x-8">
            <NavLink href="/" label="HOME" />
            <NavLink href="https://prospect-labs.gitbook.io/prospect/" label="DOCS" />
            
            {/* About Dropdown */}
            <div className="relative group nav-item-wrapper">
              <button
                className="flex items-center text-white hover:text-[#4AAEB5] transition-colors py-2 font-medium tracking-wide uppercase text-[14px]"
                aria-label="About menu"
              >
                <span>ABOUT</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              <div 
                className={cn(
                  "absolute top-full left-0 bg-[#0F1923] rounded-2xl shadow-lg w-48 transition-all duration-300 transform origin-top-left dropdown-animation opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
                )}
              >
                <div className="py-6 px-6 space-y-4 flex flex-col">
                  <NavLink href="https://www.prospectsports.xyz/about" label="ABOUT" />
                  <NavLink href="https://www.prospectsports.io/about#Team" label="OUR TEAM" />
                  <NavLink href="https://www.prospectsports.io/about#Roadmap" label="ROADMAP" />
                  <NavLink href="https://www.prospectsports.io/about#Media" label="MEDIA" />
                </div>
              </div>
            </div>
          </nav>
          
          <div className="flex items-center space-x-6">
            <SocialIcons variant="header" />
            <DownloadButtons />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={handleToggleMenu}
          className="lg:hidden text-white hover:text-[#4AAEB5] transition-colors p-2 bg-[#1D2A3B] hover:bg-[#243347] rounded-full"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-[#001118] z-[999] lg:hidden overflow-y-auto"
          style={{
            position: 'fixed',
            height: '100vh',
            width: '100vw'
          }}
        >
          <div className="container-default max-w-[1250px] mx-auto px-[24px] py-[33px] flex items-center justify-between">
            {/* Logo in mobile menu */}
            <Link href="/" className="flex items-center">
              <Image 
                src="https://cdn.prod.website-files.com/62ffc292db8ee4c6c0ebfdfc/62ffc292db8ee4805aebfe85_prospect-gaming-logo-full.svg"
                alt="Prospect"
                width={140}
                height={30}
                className="h-auto"
                priority
              />
            </Link>
            
            <button
              onClick={handleToggleMenu}
              className="text-white hover:text-[#4AAEB5] transition-colors p-2 bg-[#1D2A3B] hover:bg-[#243347] rounded-full"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="container-default max-w-[1250px] mx-auto px-[24px] py-8">
            <nav className="flex flex-col w-full">
              <NavLink 
                href="/" 
                label="HOME" 
                onClick={() => setIsOpen(false)} 
                className="text-[32px] py-4"
              />
              
              <NavLink 
                href="https://prospect-labs.gitbook.io/prospect/" 
                label="DOCS" 
                onClick={() => setIsOpen(false)} 
                className="text-[32px] py-4"
              />
              
              {/* Mobile About Dropdown Links */}
              {activeDropdown === 'mobile-about' && (
                <div className="ml-4 mt-2 space-y-3 flex flex-col">
                  <NavLink 
                    href="https://www.prospectsports.xyz/about" 
                    label="ABOUT" 
                    onClick={() => setIsOpen(false)} 
                    className="text-[24px] py-2"
                  />
                  <NavLink 
                    href="https://www.prospectsports.io/about#Team" 
                    label="OUR TEAM" 
                    onClick={() => setIsOpen(false)} 
                    className="text-[24px] py-2"
                  />
                  <NavLink 
                    href="https://www.prospectsports.io/about#Roadmap" 
                    label="ROADMAP" 
                    onClick={() => setIsOpen(false)} 
                    className="text-[24px] py-2"
                  />
                  <NavLink 
                    href="https://www.prospectsports.io/about#Media" 
                    label="MEDIA" 
                    onClick={() => setIsOpen(false)} 
                    className="text-[24px] py-2"
                  />
                </div>
              )}
            </nav>
            
            {!activeDropdown && (
              <div className="mt-8 space-y-6">
                <SocialIcons variant="header" />
                <div className="flex flex-row items-center space-x-4">
                  <DownloadButtons />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;