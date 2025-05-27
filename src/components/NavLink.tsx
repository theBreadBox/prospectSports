import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

const NavLink = ({ href, label, onClick, className }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  // Check if the href is external
  const isExternal = href.startsWith('http');

  const baseStyles = "text-white hover:text-[#4AAEB5] transition-colors font-medium tracking-[.1em] uppercase";
  
  if (isExternal) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={cn(
          baseStyles,
          className,
          isActive && "text-[#4AAEB5]"
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        baseStyles,
        className,
        isActive && "text-[#4AAEB5]"
      )}
    >
      {label}
    </Link>
  );
};

export default NavLink;