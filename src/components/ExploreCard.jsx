/* eslint-disable @next/next/no-img-element */

'use client';

import { motion } from 'framer-motion';

import styles from '../styles';
import { fadeIn } from '../utils/motion';

const ExploreCard = ({ id, imgUrl, title, index, active, handleClick }) => (
  <motion.div
    variants={fadeIn('right', 'spring', index * 0.5, 0.75)}
    className={`relative ${
      active === id ? 'lg:flex-[3.5] flex-[10]' : 'lg:flex-[0.5] flex-[2]'
    } flex items-center justify-center min-w-[170px] h-[700px] transition-[flex] duration-[0.7s] ease-out-flex cursor-url('/whtBone.png')`}
    onMouseEnter={() => handleClick(id)}
  >
    
    <img
      src={imgUrl}
      alt="images"
      className="absolute flex items-center justify-center w-full h-full object-cover rounded-[24px]"
    />
    {active !== id ? (
      <h3 className="font-semibold sm:text-[58px] text-[28px] text-white absolute z-0 lg:bottom-20 lg:rotate-[-90deg] lg:origin-[0,0]">
        {}
      </h3>
    ) : (
      <div className="absolute bottom-0 p-8 flex justify-start w-full flex-col bg-[rgba(0,0,0,0.5)] rounded-b-[24px]">
       
        
        <h2 className="mt-[2px] font-semibold sm:text-[32px] text-[24px] text-white">
          {title}
        </h2>
      </div>
      
    )}
  </motion.div>
);

export default ExploreCard;
