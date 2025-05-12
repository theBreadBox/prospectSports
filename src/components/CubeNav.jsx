'use client';

import React, { useRef } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import { useRouter } from 'next/navigation';
import styles from './cubenav.module.css';

export default function CubeNav() {
    const container = useRef(null);

    return (
        <div ref={container} className={styles.main}>
            <div className={styles.cube}>
                <Canvas>
                    <OrbitControls enableZoom={true} enablePan={true} />
                    <ambientLight intensity={2.5} />
                    <directionalLight position={[2, 3, 3]} intensity={5} />
                    <directionalLight position={[-2, -3, -3]} intensity={3} />
                    <CubeObject />
                </Canvas>
            </div>
        </div>
    );
}

function CubeObject() {
    const mesh = useRef(null);
    const router = useRouter();
    const { raycaster, camera, pointer } = useThree();

    // Define textures for faces
    const textures = [
        useLoader(TextureLoader, "/assets/home.png"), // home face
        useLoader(TextureLoader, "/assets/comingSoon.png"), // Left face
        useLoader(TextureLoader, "/assets/referPage.png"), // Top face
        useLoader(TextureLoader, "/assets/comingSoon.png"), // Bottom face
        useLoader(TextureLoader, "/assets/website.png"), // Front face
        useLoader(TextureLoader, "/assets/comingSoon.png"), // Back face
    ];

    // Define the routes corresponding to each face
    const faceRoutes = [
        "/", // Home page (was "/page1")
        "/page2",
        "/page3",
        "/page4",
        "https://www.prospectsports.xyz/",
        "/page6",
    ];

    // Handle clicking on a cube face
    const handleFaceClick = (faceIndex) => {
        const route = faceRoutes[faceIndex];
        if (route) {
            console.log(`Navigating to ${route}`);
            // Check if it's an external URL
            if (route.startsWith('http://') || route.startsWith('https://')) {
                window.open(route, '_blank'); // Open external URLs in a new tab
            } else {
                // Navigate to internal route
                router.push(route);
            }
        }
    };

    const onPointerDown = (event) => {
        event.stopPropagation();
        const intersects = raycaster.intersectObject(mesh.current);
        if (intersects.length > 0) {
            const faceIndex = Math.floor(intersects[0].faceIndex / 2);
            handleFaceClick(faceIndex);
        }
    };

    // Set up raycaster on each frame
    useFrame(() => {
        raycaster.setFromCamera(pointer, camera);
    });

    // Add subtle automatic rotation
    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.y += delta * 0.1; // Slow rotation on Y axis
            mesh.current.rotation.x += delta * 0.05; // Even slower rotation on X axis
        }
    });

    // Create a simple material with white text for each face
    const createCanvasTexture = (number) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Draw the number in the center
        context.fillStyle = 'white';
        context.font = 'bold 120px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(number.toString(), 128, 128);
        
        return canvas;
    };

    return (
        <motion.mesh 
            ref={mesh} 
            onPointerDown={onPointerDown}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
            <boxGeometry args={[3, 3, 3]} />
            {textures.map((texture, i) => (
                <meshStandardMaterial
                    key={i}
                    map={texture}
                    attach={`material-${i}`}
                    metalness={0.3}
                    roughness={0.2}
                    emissive=""
                    emissiveIntensity={0.05}
                />
            ))}
        </motion.mesh>
    );
} 