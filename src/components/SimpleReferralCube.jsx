'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import styles from './cubenav.module.css';

// Meme images for each completed referral
const MEME_IMAGES = [
  "/assets/meme1.png",
  "/assets/meme2.png",
  "/assets/meme3.png",
  "/assets/meme4.png",
  "/assets/meme5.png"
];

// Fallback images if memes aren't available
const FALLBACK_IMAGES = [
  "/assets/referPage.png",
  "/assets/home.png",
  "/assets/website.png",
  "/assets/comingSoon.png",
  "/assets/comingSoon.png"
];

export default function ReferralCube({ totalReferred = 0, allCompleted = false }) {
  const container = useRef(null);

  return (
    <div ref={container} className={styles.main}>
      <div className={`${styles.cube} ${allCompleted ? styles.completedCube : ''}`}>
        <Canvas>
          <OrbitControls enableZoom={false} enablePan={false} />
          <ambientLight intensity={2.5} />
          <directionalLight position={[2, 3, 3]} intensity={5} />
          <directionalLight position={[-2, -3, -3]} intensity={3} />
          <CubeObject 
            totalReferred={totalReferred} 
            allCompleted={allCompleted} 
          />
        </Canvas>
      </div>
    </div>
  );
}

function CubeObject({ totalReferred, allCompleted }) {
  const mesh = useRef(null);
  const { raycaster, camera, pointer } = useThree();
  
  // Direct texture loading with useLoader hook
  // Load individual textures for memes
  const memeTexture1 = useLoader(TextureLoader, MEME_IMAGES[0], undefined, () => new TextureLoader().load(FALLBACK_IMAGES[0]));
  const memeTexture2 = useLoader(TextureLoader, MEME_IMAGES[1], undefined, () => new TextureLoader().load(FALLBACK_IMAGES[1]));
  const memeTexture3 = useLoader(TextureLoader, MEME_IMAGES[2], undefined, () => new TextureLoader().load(FALLBACK_IMAGES[2]));
  const memeTexture4 = useLoader(TextureLoader, MEME_IMAGES[3], undefined, () => new TextureLoader().load(FALLBACK_IMAGES[3]));
  const memeTexture5 = useLoader(TextureLoader, MEME_IMAGES[4], undefined, () => new TextureLoader().load(FALLBACK_IMAGES[4]));
  
  // Empty/incomplete texture
  const emptyTexture = useLoader(TextureLoader, "/assets/emptyReferral.png", undefined, 
    () => new TextureLoader().load(FALLBACK_IMAGES[0]));
  
  // Celebration texture for when all referrals are complete
  const celebrationTexture = useLoader(TextureLoader, "/assets/allComplete.png", undefined, 
    () => new TextureLoader().load(FALLBACK_IMAGES[0]));
  
  // Create array of textures for each face based on referral progress
  const textures = [
    totalReferred >= 1 ? memeTexture1 : emptyTexture, // Face 1
    totalReferred >= 2 ? memeTexture2 : emptyTexture, // Face 2
    totalReferred >= 3 ? memeTexture3 : emptyTexture, // Face 3
    totalReferred >= 4 ? memeTexture4 : emptyTexture, // Face 4
    totalReferred >= 5 ? memeTexture5 : emptyTexture, // Face 5
    allCompleted ? celebrationTexture : emptyTexture,   // Face 6 (bottom)
  ];

  // Control automatic rotation
  const rotationSpeed = allCompleted ? 0.2 : 0.05;
  
  // Special animation for completed cube
  useFrame((state, delta) => {
    if (mesh.current) {
      if (allCompleted) {
        // Celebration rotation
        mesh.current.rotation.y += delta * rotationSpeed;
        mesh.current.rotation.x += delta * (rotationSpeed / 2);
      } else {
        // Regular rotation with some wobble
        mesh.current.rotation.y += delta * rotationSpeed;
        // Add subtle bobbing effect
        mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      }
    }
  });

  // Set up raycaster on each frame for interaction
  useFrame(() => {
    raycaster.setFromCamera(pointer, camera);
  });

  // Add glow effect for completed referrals
  const emissiveIntensity = allCompleted ? 0.5 : 
                           totalReferred > 0 ? 0.2 + (totalReferred * 0.05) : 0.05;
  const emissiveColor = allCompleted ? "#00ff00" : "#4ae5fb";

  return (
    <motion.mesh 
      ref={mesh} 
      whileHover={{ scale: 1.05 }}
      animate={allCompleted ? { 
        scale: [1, 1.1, 1],
        rotateZ: [0, 0.1, 0]
      } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 10,
        repeat: allCompleted ? Infinity : 0,
        repeatType: "reverse",
        duration: 2
      }}
    >
      <boxGeometry args={[3, 3, 3]} />
      {textures.map((texture, i) => (
        <meshStandardMaterial
          key={i}
          map={texture}
          attach={`material-${i}`}
          metalness={0.3}
          roughness={0.2}
          emissive={emissiveColor}
          emissiveIntensity={
            // Increase glow for completed faces
            totalReferred >= i + 1 || (i === 5 && allCompleted) 
              ? emissiveIntensity 
              : 0.05
          }
        />
      ))}
    </motion.mesh>
  );
} 