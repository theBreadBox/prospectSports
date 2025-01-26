'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, index }) => {
  return (
    <motion.div
      className="card"
      initial={{ y: index * 20 }}
      whileHover={{ y: -10 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;