"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Text, OrbitControls, useTexture, Plane, Edges } from '@react-three/drei';
import * as THREE from 'three';

export interface ReferredUser {
  referred_email: string;
  referred_wallet: string;
}

interface ReferralCubeProps {
  userReferralCode: string | null;
 
  referralStats: {
    total_referred: number;
    // remaining_uses: number; // We might use this later for more detailed face states
  } | null;
  referredUsers: ReferredUser[];
  neonEffectActive?: boolean;
}

interface FaceDetail {
  text?: string;
  texturePath?: string;
  baseColor?: THREE.Color;
  textColor: string;
  fontSize: number;
  isUserFace?: boolean;
  isReferralCompleteFace?: boolean;
  displayedText?: string | null;
}

const CubeFaceText: React.FC<{
  text: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color?: string;
  fontSize?: number;
}> = ({ text, position, rotation, color = '#FFF', fontSize = 0.3 }) => {
  return (
    <Text
      position={position}
      rotation={rotation}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      maxWidth={1.8} // Max width of text relative to cube face size (2x2)
      textAlign="center"
    >
      {text}
    </Text>
  );
};

// Define colors
const TEAL_COLOR = new THREE.Color('#4ae5fb');
const GOLD_COLOR = '#FFD700';
const DEFAULT_FACE_COLOR = new THREE.Color('#555555'); // Darker grey for default
const USER_FACE_COLOR = new THREE.Color('#444444'); // Slightly different for user face
const NEON_BORDER_COLOR = '#4ae5fb'; // Color for the neon border

const ReferralCubeComponent: React.FC<ReferralCubeProps> = ({ userReferralCode, referralStats, referredUsers, neonEffectActive }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const thumbsUpTexture = useTexture('/Champster_ThumbsUp_Left.png');
  const sittingChampsterTexture = useTexture('/Champster_Sitting_Left.png');
  const heroChampsterTexture = useTexture('/Champster_Hero.png'); // Load hero texture

  // Basic auto-rotation, can be removed if only manual orbit is desired
  useFrame(() => {
    if (meshRef.current) {
      // meshRef.current.rotation.x += 0.005;
      // meshRef.current.rotation.y += 0.005;
    }
  });

  const totalSlots = 5; // Assuming 5 referral slots
  const referredCount = referralStats?.total_referred ?? 0;

  const faceDetails: FaceDetail[] = [];

  // User Face (Front - index 0)
  faceDetails.push({
    texturePath: '/Champster_Hero.png', // Set hero image texture path
    baseColor: TEAL_COLOR,
    textColor: '#FFFFFF',
    fontSize: 0.18,
    isUserFace: true,
    
  });

  // Referral Faces (Back, Top, Bottom, Right, Left - indices 1 to 5)
  // Order: Back, Top, Bottom, Right, Left (to match faceConfigs)
  for (let i = 0; i < totalSlots; i++) {
    const referredUser = referredUsers[i]; // Get user from the ordered list from API
    if (referredUser) {
      faceDetails.push({
        texturePath: '/Champster_ThumbsUp_Left.png',
        baseColor: TEAL_COLOR,
        textColor: '#FFFFFF',
        fontSize: 0.18,
        isReferralCompleteFace: true,
        
      });
    } else {
      faceDetails.push({
        texturePath: '/Champster_Sitting_Left.png',
        baseColor: DEFAULT_FACE_COLOR,
        textColor: '#AAAAAA',
        fontSize: 0.22,
      });
    }
  }

  // Positions and rotations for text on each face of a 2x2x2 cube
  const textOffset = 1.01;
  const faceConfigs = [
    { position: [0, 0, textOffset], rotation: [0, 0, 0] },         // Front (User)
    { position: [0, 0, -textOffset], rotation: [0, Math.PI, 0] },  // Back (Referral 1)
    { position: [0, textOffset, 0], rotation: [-Math.PI / 2, 0, 0] }, // Top (Referral 2)
    { position: [0, -textOffset, 0], rotation: [Math.PI / 2, 0, 0] },// Bottom (Referral 3)
    { position: [textOffset, 0, 0], rotation: [0, Math.PI / 2, 0] }, // Right (Referral 4)
    { position: [-textOffset, 0, 0], rotation: [0, -Math.PI / 2, 0] }// Left (Referral 5)
  ];

  // Assign materials to each face of the Box geometry
  const materials = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: faceDetails[4]?.baseColor || DEFAULT_FACE_COLOR }), // Right
    new THREE.MeshStandardMaterial({ color: faceDetails[5]?.baseColor || DEFAULT_FACE_COLOR }), // Left
    new THREE.MeshStandardMaterial({ color: faceDetails[2]?.baseColor || DEFAULT_FACE_COLOR }), // Top
    new THREE.MeshStandardMaterial({ color: faceDetails[3]?.baseColor || DEFAULT_FACE_COLOR }), // Bottom
    new THREE.MeshStandardMaterial({ color: faceDetails[0]?.baseColor || DEFAULT_FACE_COLOR }), // Front (User Face)
    new THREE.MeshStandardMaterial({ color: faceDetails[1]?.baseColor || DEFAULT_FACE_COLOR }), // Back
  ], [faceDetails]);

  return (
    <Box ref={meshRef} args={[2, 2, 2]} material={materials}>
      {neonEffectActive && (
        <Edges
          scale={1.01} // Slightly larger to ensure visibility around the box
          color={NEON_BORDER_COLOR}
          // material can be customized further if needed, e.g. LineMaterial for thickness
          // threshold={15} // default is 15, fine for a cube
        />
      )}
      {faceConfigs.map((config, index) => {
        const detail = faceDetails[index];
        if (!detail) return null;

        const offset = 0.01;
        let decalImage = null;
        let textureForDecal = null;
        let materialForDecal = null; // To store the appropriate material component

        if (detail.isUserFace && detail.texturePath === '/Champster_Hero.png') {
          textureForDecal = heroChampsterTexture;
          materialForDecal = (
            <meshStandardMaterial 
              map={textureForDecal} 
              transparent={true} 
              depthWrite={false} 
            />
          );
        } else if (detail.isReferralCompleteFace && detail.texturePath === '/Champster_ThumbsUp_Left.png') {
          textureForDecal = thumbsUpTexture;
          materialForDecal = (
            <meshStandardMaterial 
              map={textureForDecal} 
              transparent={true} 
              depthWrite={false} 
              emissive="transparent" // As per user's last change
              emissiveIntensity={0.5}   // As per user's last change
            />
          );
        } else if (detail.texturePath === '/Champster_Sitting_Left.png' && !detail.isReferralCompleteFace && !detail.isUserFace) {
          textureForDecal = sittingChampsterTexture;
          materialForDecal = (
            <meshStandardMaterial 
              map={textureForDecal} 
              transparent={true} 
              depthWrite={false} 
            />
          );
        }
        
        if (textureForDecal && materialForDecal) {
          const decalPosition: [number, number, number] = [...config.position as [number,number,number]];
          if(decalPosition[0] !== 0) decalPosition[0] *= (1 + offset / Math.abs(decalPosition[0]));
          if(decalPosition[1] !== 0) decalPosition[1] *= (1 + offset / Math.abs(decalPosition[1]));
          if(decalPosition[2] !== 0) decalPosition[2] *= (1 + offset / Math.abs(decalPosition[2]));

          const decalSize: [number, number] = [1.6, 1.6]; 
          decalImage = (
            <Plane args={decalSize} position={decalPosition} rotation={config.rotation as [number,number,number]}>
              {materialForDecal} {/* Use the selected material component */}
            </Plane>
          );
        }

        let faceTextContent = null;
        if ((detail.isUserFace || detail.isReferralCompleteFace) && detail.displayedText && detail.texturePath) {
            const basePosition: [number, number, number] = [...config.position as [number,number,number]];
            const textOffsetDistance = 0.02 + offset;

            const textPosition: [number, number, number] = [...basePosition];
            if(textPosition[0] !== 0) textPosition[0] *= (1 + textOffsetDistance / Math.abs(textPosition[0]));
            if(textPosition[1] !== 0) textPosition[1] *= (1 + textOffsetDistance / Math.abs(textPosition[1]));
            if(textPosition[2] !== 0) textPosition[2] *= (1 + textOffsetDistance / Math.abs(textPosition[2]));

            const yShift = -0.9;
            const finalTextPosition = new THREE.Vector3(...textPosition);
            const localYDown = new THREE.Vector3(0, yShift, 0);
            const faceQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(...config.rotation as [number,number,number]));
            localYDown.applyQuaternion(faceQuaternion);
            finalTextPosition.add(localYDown);

            faceTextContent = (
                <Text
                    position={finalTextPosition}
                    rotation={config.rotation as [number, number, number]}
                    fontSize={detail.fontSize} 
                    color={detail.textColor}
                    fontWeight="bold"
                    anchorX="center"
                    anchorY="bottom"
                    lineHeight={0.8}
                    maxWidth={1.4}
                    textAlign="center"
                >
                    {detail.displayedText} 
                </Text>
            );
        } else if (detail.text && !detail.texturePath) {
            faceTextContent = (
                <CubeFaceText
                    text={detail.text}
                    position={config.position as [number, number, number]}
                    rotation={config.rotation as [number, number, number]}
                    fontSize={detail.fontSize}
                    color={detail.textColor}
                />
            );
        }

        return (
          <React.Fragment key={`face-content-${index}`}>
            {decalImage}
            {faceTextContent}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

const ReferralCube: React.FC<ReferralCubeProps> = (props) => {
  if (!props.userReferralCode || !props.referralStats || !props.referredUsers) {
    return <p className="text-center">Loading Cube Data...</p>; 
  }

  return (
    <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
      <ambientLight intensity={1.0} />
      <pointLight position={[10, 10, 10]} intensity={5.0} />
      <ReferralCubeComponent {...props} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

export default ReferralCube; 