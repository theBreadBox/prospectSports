import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Sidebar = ({ isOpen, toggle }) => {
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  return (
    <motion.div
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      className="sidebar"
    >
      <button onClick={toggle}>Close</button>
      <ul>
        <li><Link href="#section1">Section 1</Link></li>
        <li><Link href="#section2">Section 2</Link></li>
        <li><Link href="#section3">Section 3</Link></li>
        <li><Link href="#section4">Section 4</Link></li>
        <li><Link href="#section5">Section 5</Link></li>
        <li><Link href="#section6">Section 6</Link></li>
        <li><Link href="#section7">Section 7</Link></li>
        <li><Link href="#section8">Section 8</Link></li>
      </ul>
    </motion.div>
  );
};

export default Sidebar;