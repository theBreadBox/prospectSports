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

export default function NavLink({ href, label, onClick, className }: NavLinkProps) {
  const pathname = usePathname();
  const isExternal = href.startsWith('http');
  
  // For internal links, check if the current pathname matches the href
  const isActive = !isExternal && pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={cn(
        "transition-colors duration-200 font-medium tracking-wide uppercase text-[16px]",
        isActive ? "text-[#4AE5FB]" : "text-white hover:text-[#4AE5FB]",
        className
      )}
    >
      {label}
    </Link>
  );
}