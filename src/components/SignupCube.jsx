'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import styles from './cubenav.module.css';

export default function SignupCube({ currentStep, signupComplete, onCubeClick }) {
    const container = useRef(null);

    return (
        <div ref={container} className={styles.main} onClick={onCubeClick}>
            <div className={`${styles.cube} ${signupComplete ? styles.completedCube : ''}`}>
                <Canvas>
                    <OrbitControls enableZoom={false} enablePan={false} />
                    <ambientLight intensity={2.5} />
                    <directionalLight position={[2, 3, 3]} intensity={5} />
                    <directionalLight position={[-2, -3, -3]} intensity={3} />
                    <CubeObject 
                        currentStep={currentStep} 
                        signupComplete={signupComplete} 
                    />
                </Canvas>
            </div>
        </div>
    );
}

function CubeObject({ currentStep, signupComplete }) {
    const mesh = useRef(null);
    const { raycaster, camera, pointer } = useThree();
    
    // Define step textures - fallback to default textures if they don't exist
    const stepTextures = [
        useLoader(TextureLoader, "/assets/signup_step1.png", undefined, (error) => {
            console.warn("Fallback to default texture", error);
            return new TextureLoader().load("/assets/home.png");
        }),
        useLoader(TextureLoader, "/assets/signup_step2.png", undefined, (error) => {
            console.warn("Fallback to default texture", error);
            return new TextureLoader().load("/assets/referPage.png");
        }),
        useLoader(TextureLoader, "/assets/signup_step3.png", undefined, (error) => {
            console.warn("Fallback to default texture", error);
            return new TextureLoader().load("/assets/website.png");
        }),
    ];

    // Completion meme texture
    const completionTexture = useLoader(TextureLoader, "/assets/signup_complete.png", undefined, (error) => {
        console.warn("Fallback to default texture", error);
        return new TextureLoader().load("/assets/comingSoon.png");
    });
    
    // Create cube face textures based on the current state
    const textures = [
        currentStep >= 0 ? stepTextures[0] : null, // Front face (Step 1)
        currentStep >= 1 ? stepTextures[1] : null, // Right face (Step 2)
        currentStep >= 2 ? stepTextures[2] : null, // Back face (Step 3)
        signupComplete ? completionTexture : null, // Left face (completion)
        signupComplete ? completionTexture : null, // Top face (completion)
        signupComplete ? completionTexture : null, // Bottom face (completion)
    ].map(texture => texture || stepTextures[0]); // Fallback to first texture if null

    // Control automatic rotation speed
    const rotationSpeed = signupComplete ? 0.2 : 0.05;
    
    // Animate the cube to show the appropriate face based on the current step
    useFrame((state, delta) => {
        if (mesh.current) {
            if (signupComplete) {
                // Celebration rotation
                mesh.current.rotation.y += delta * rotationSpeed;
                mesh.current.rotation.x += delta * (rotationSpeed / 2);
            } else {
                // Rotate to show the current step
                const targetRotationY = Math.PI / 2 * currentStep;
                
                // Smooth rotation to target
                mesh.current.rotation.y += (targetRotationY - mesh.current.rotation.y) * 0.1;
                
                // Add slight continuous movement for effect
                mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
            }
        }
    });

    // Set up raycaster on each frame for interaction
    useFrame(() => {
        raycaster.setFromCamera(pointer, camera);
    });

    // Add glow effect for completed signup
    const emissiveIntensity = signupComplete ? 0.5 : 0.05;
    const emissiveColor = signupComplete ? "#00ff00" : "#4ae5fb";

    return (
        <motion.mesh 
            ref={mesh} 
            whileHover={{ scale: 1.05 }}
            animate={signupComplete ? { 
                scale: [1, 1.1, 1],
                rotateZ: [0, 0.1, 0]
            } : {}}
            transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 10,
                repeat: signupComplete ? Infinity : 0,
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
                    emissiveIntensity={emissiveIntensity}
                />
            ))}
        </motion.mesh>
    );
} 