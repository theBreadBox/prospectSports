'use client';

import { motion, useAnimation } from 'framer-motion';
import { useState, useEffect } from 'react';
import styles from '../styles';
import { fadeIn, staggerContainer } from '../utils/motion';

const Feedback = () => {
  const controls = useAnimation();
  const imageControls = useAnimation();
  const [offsetY, setOffsetY] = useState(0);

  const handleScroll = () => {
    setOffsetY(window.pageYOffset);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const sequence = async () => {
      await controls.start("show");
      imageControls.start("zoomed");
    };
    sequence();
  }, [controls, imageControls]);

  return (
    <>
      <motion.div
        variants={fadeIn('right', 'tween', 0.1, 1)}
        className="relative flex-1 flex justify-center items-center left-0"
      >
        
        <div
          style={{
            position: 'relative',
            paddingBottom: '100%', // 16:9 aspect ratio
            height: 0,
            width: '100%',
            overflow: 'hidden',
          }}
        >
           <p className="mt-[8px] font-normal sm:text-[24px] text-[18px] sm:leading-[32.68px] leading-[26.68px] text-white">

BLAH BLAH BLAH BLAH <span className="font-extrabold text-[#4ae5fb]">ACCENT WORD</span> BLAH BLAH BLAH BLAH

</p>
        
        </div>
      </motion.div>

 
        
        <motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.25 }} // Set 'once: true' to keep it visible after appearing
  className={`${styles.innerWidth} mx-auto flex lg:flex-row flex-col gap-6 `}
>
<h4 className="font-bold sm:text-[42px] text-[30px] sm:leading-[60.32px] leading-[46.32px] text-[#e6bd9c] ">
                About something or other:
              </h4>
              <p className="mt-[8px] font-normal sm:text-[24px] text-[18px] sm:leading-[32.68px] leading-[26.68px] text-white">

                BLAH BLAH BLAH BLAH <span className="font-extrabold text-[#4ae5fb]">ACCENT WORD</span> BLAH BLAH BLAH BLAH
                
              </p>

        </motion.div>
      
    </>
  );
};

export default Feedback;
