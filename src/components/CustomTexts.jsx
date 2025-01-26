'use client';

import { motion } from 'framer-motion';
import { textContainer, textVariant2 } from '../utils/motion';


export const TypingText = ({ title, textStyles }) => (
  <motion.p
    variants={textContainer}
    className={`font-bold text-[60px] text-black ${textStyles}`}
  >
    {Array.from(title).map((letter, index) => (
      <motion.span variants={textVariant2} key={index}>
        {letter === ' ' ? '\u00A0' : letter}
      </motion.span>
    ))}
  </motion.p>
);

export const TitleText = ({ title, textStyles }) => (
  <motion.h2
    variants={textVariant2}
    initial="hidden"
    whileInView="show"
    className={`mt-[8px] font-bold md:text-[50px] text-[40px] text-black ${textStyles}`}
   
  >
    {title}
  </motion.h2>
);



export const OtherText = ({ title, textStyles }) => (
  
  <motion.h2
    variants={textVariant2}
    initial="hidden"
    whileInView="show"
    className={`mt-[8px] md:text-[30px] text-[40px] pr-4 text-black ${textStyles}`}
  >
    {title}
  </motion.h2>
);
