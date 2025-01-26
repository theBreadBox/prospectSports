'use client';

import { motion } from 'framer-motion';
import { socials } from '../constants';

import styles from '../styles';
import { footerVariants } from '../utils/motion';

const Footer = () => (
  
<motion.footer
  variants={footerVariants}
  initial="hidden"
  whileInView="show"
  style={{
    backgroundColor: "transparent",
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    height: "20vh", // Make the footer take up the full viewport height
    width: "100vw", // Ensure it takes up the full viewport width
    position: "relative", // Use relative positioning for centering
    zIndex: 99,
    
    marginTop: '-20vh',
  }}
  className={` py-4 flex items-center justify-center`} // Center content
>
  <div
    className="flex items-center justify-center flex-wrap gap-6" // Center icons
    style={{
      width: "auto",
      height: "auto",
      position: "absolute",
    }}
  >
    {socials.map((social) => (
      <a key={social.name} href={social.link} target="_blank" rel="noopener noreferrer">
        <motion.div 
          variants={footerVariants}
          whileHover={{ 
            scale: 2, 
            y: -5, 
            rotateX: 10, 
            rotateY: -10 
          }} // Add parallax and scale effects on hover
          transition={{ 
            type: 'spring', 
            stiffness: 300 
          }} // Adjust this value to control the parallax effect
          className="flex flex-row justify-center items-center"
        >
          <img
            key={social.name}
            src={social.url}
            alt={social.name}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-cover cursor-pointer"
            whileHover={{ 
              scale: 2.6, 
              y: -5, 
              rotateX: 10, 
              rotateY: -10 
            }} // Add parallax and scale effects on hover
            transition={{ 
              type: 'spring', 
              stiffness: 300 
            }}
          />
        </motion.div>
      </a>
    ))}
  </div>
  <p className="font-normal text-[14px] text-white opacity-60 text-center absolute bottom-4 w-full">
    Copyright © 2024 - 2025 BitDogs. All rights reserved.
  </p>
</motion.footer>
  
);

export default Footer;