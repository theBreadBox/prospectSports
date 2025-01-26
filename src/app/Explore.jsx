'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles';
import { exploreWorlds } from '../constants';
import {  slideIn, staggerContainer } from '../utils/motion';
import { ExploreCard, TitleText } from '../components';

const Explore = () => {
  const [active, setActive] = useState('bitdog-1');
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  const handleScroll = () => {
    setOffsetY(window.pageYOffset);
    setOffsetX(window.pageYOffset);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  

  return (
    
    <><section
      style={{
        backgroundImage: "linear-gradient(rgba(61, 61, 59, 1), rgba(0, 0, 0, 1))",
        backgroundSize: "cover max-width: 768px", // Ensure the image covers the entire background
        backgroundPosition: "center", // Center the image
        backgroundRepeat: "no-repeat", // Prevent the image from repeating
        height: 'auto',
        minHeight: '100%',

        width: 'auto',
        position: "relative",
        
        paddingBottom: "20px",
        marginBottom: '10%', // To position any additional content relative to the section
        zIndex: 0
      }}

      className={`${styles.paddings}`} id="explore">
        

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
          className={`${styles.innerWidth} mx-auto flex flex-col`}
          
        >



      
<motion.img
      src="bdLogo4.png"
      alt="Custom Image"
      style={{
        width: '100%', // Adjust the width as needed
        height: 'auto',
        marginTop: -30,
        marginBottom: '20px' // Add some spacing between the image and the TypingText container
      }}
      variants={slideIn('left', 'tween', 0.2, 1)}
      whileHover={{ 
        scale: 1.2, 
        y: -5, 
        rotateX: 10, 
        rotateY: -10 
      }} // Add parallax and scale effects on hover
      transition={{ 
        type: 'spring', 
        stiffness: 300 
      }}
    />
         
      
          <TitleText
            title={<>Here is where the the art <span className="font-extrabold text-[#f9941b]">showcase</span> will go <br 
            className="md:block hidden" />
            </>}
            textStyles="text-center text-secondary-white" />
          
          <div className="mt-[50px] flex lg:flex-row flex-col min-h-[70vh] pb-20 gap-5">
            {exploreWorlds.map((project, index) => (
              <ExploreCard
                key={project.id}
                {...project}
                index={index}
                active={active}
                handleClick={setActive} />
            ))}
             

          </div>
          <div className="flex items-center justify-center w-full flex-wrap gap-6 absolute bottom-0 left-0 right-0 pb-0" style={{ transform: 'translateY(40%)' }}>
             
              <a 
                href="/explorer" // Replace with the actual link
                target="_blank" // Opens the link in a new tab
                rel="noopener noreferrer" // Security feature
                className="flex flex-col items-center px-4 md:pl-10 md:pr-40"
              >
                <span className="mt-2 text-center text-[30px] md:text-[50px] font-bold text-white hover:text-yellow-500">
                  Explore the Collection
                </span>
              </a>
                                
              <a 
                href="https://magiceden.us/ordinals/marketplace/bitdogs_btc" // Replace with the actual link
                target="_blank" // Opens the link in a new tab
                rel="noopener noreferrer" // Security feature
                className="flex flex-col items-center px-4 md:pl-40 md:pr-10"
              >
                <span className="mt-2 text-center text-[30px] md:text-[50px] font-bold text-white hover:text-yellow-500">
                  Buy Now
                </span>
              </a>
            </div>
          
        </motion.div>
        

      </section>
      </>
      
  );
};

export default Explore;
