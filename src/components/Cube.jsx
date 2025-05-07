'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import styles from './style.module.scss';
import { OrbitControls } from '@react-three/drei';
import { useSpring, useScroll, useTransform } from 'framer-motion';
import { motion } from 'framer-motion-3d';

export default function Cube() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end']
    });
    const progress = useTransform(scrollYProgress, [0, 1], [0, 5]);
    const smoothProgress = useSpring(progress, { damping: 20 });

    return (
        <div ref={container} className={styles.main}>
            <div className={styles.cube}>
                <Canvas>
                    <OrbitControls enableZoom={false} enablePan={false} />
                    <ambientLight intensity={5} />
                    <directionalLight position={[2, 3, 3]} />
                    <Cube progress={smoothProgress} />
                </Canvas>
            </div>
        </div>
    );
}

function Cube({ progress }) {
    const mesh = useRef(null);
    const { raycaster, camera, pointer } = useThree();
    const [subdivided, setSubdivided] = useState(false);
    const [cubePositions, setCubePositions] = useState([]);

    const textures = [
        useLoader(TextureLoader, "/assets/1.jpg"),
        useLoader(TextureLoader, "/assets/2.jpg"),
        useLoader(TextureLoader, "/assets/3.jpg"),
        useLoader(TextureLoader, "/assets/4.jpg"),
        useLoader(TextureLoader, "/assets/5.jpg"),
        useLoader(TextureLoader, "/assets/6.jpg"),
    ];

    useEffect(() => {
        progress.onChange((v) => {
            if (v >= 1 && !subdivided) {
                subdivideCube();
            } else if (v < 1 && subdivided) {
                revertToOriginalCube();
            }
        });
        return () => unsubscribe();
    }, [progress, subdivided]);

    const subdivideCube = () => {
        setSubdivided(true);
        const positions = [
            { pos: [1.5, 0, 0], rot: [0, Math.PI / 2, 0] }, // Right face
            { pos: [-1.5, 0, 0], rot: [0, -Math.PI / 2, 0] }, // Left face
            { pos: [0, 1.5, 0], rot: [-Math.PI / 2, 0, 0] }, // Top face
            { pos: [0, -1.5, 0], rot: [Math.PI / 2, 0, 0] }, // Bottom face
            { pos: [0, 0, 1.5], rot: [0, 0, 0] }, // Front face
            { pos: [0, 0, -1.5], rot: [0, Math.PI, 0] } // Back face
        ];
        setCubePositions(positions);
    };

    const revertToOriginalCube = () => {
        setSubdivided(false);
        setCubePositions([]);
    };

    const handleFaceClick = (faceIndex) => {
        const urls = [
            "https://twitter.com/TheeHustleHouse",
            "https://twitter.com/DCBK2LA",
            "https://twitter.com/bitdogs_btc",
            "https://twitter.com/llSANDMANll",
            "https://twitter.com/_bcbread",
            "https://twitter.com/TO"
        ];
        window.open(urls[faceIndex], "_blank");
    };

    const onPointerDown = (event) => {
        event.stopPropagation();
        const intersects = raycaster.intersectObject(mesh.current);
        if (intersects.length > 0) {
            const faceIndex = Math.floor(intersects[0].faceIndex / 2);
            handleFaceClick(faceIndex);
        }
    };

    useFrame(() => {
        raycaster.setFromCamera(mouse, camera);
    });

    if (subdivided) {
        return (
            <>
                {cubePositions.map((config, index) => (
                    <motion.mesh
                        key={index}
                        position={config.pos}
                        rotation={config.rot}
                        rotation-y={progress}
                        rotation-x={progress}
                    >
                        <boxGeometry args={[1.5, 1.5, 0.5]} />
                        <meshStandardMaterial
                            map={textures[index]}
                             
                            metalness={0.8}
                            roughness={0.2}
                        />
                        
                    </motion.mesh>
                ))}
            </>
        );
    }

    return (
        <motion.mesh ref={mesh} rotation-y={progress} rotation-x={progress} onPointerDown={onPointerDown}>
            <boxGeometry args={[2, 2, ]} />
            {textures.map((texture, i) => (
                <meshStandardMaterial
                    key={i}
                    map={texture}
                    attach={`material-${i}`}
                    metalness={0.8}
                    roughness={0.2}
                />
            ))}
        </motion.mesh>
    );
}
