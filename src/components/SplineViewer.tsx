import React, { Suspense, useRef, useState, useEffect } from "react";
import Spline from '@splinetool/react-spline';
import { ReferredUser } from './ReferralCube';
import type { Application } from '@splinetool/runtime';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
}

interface SplineViewerProps {
  referralCode: string;
  onAnimationComplete?: () => void;
}

export const SplineViewer: React.FC<SplineViewerProps> = ({
  referralCode,
  onAnimationComplete
}) => {
  const splineRef = useRef<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referredUsersList, setReferredUsersList] = useState<ReferredUser[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showCubeNeonEffect, setShowCubeNeonEffect] = useState(false);

  const getSplineSceneUrl = () => {
    // Map referral counts to specific Spline scenes
    const sceneUrls: { [key: string]: string } = {
      '1': 'https://prod.spline.design/WbZpxjhySysoPEbZ/scene.splinecode',
      '2': 'https://prod.spline.design/GJy3SkmvCGPuUDZ5/scene.splinecode',
      '3': 'https://prod.spline.design/qbm36HS4X5dCB4Fh/scene.splinecode',
      '4': 'https://prod.spline.design/sNT40GKtl2J-PwV5/scene.splinecode',
      '5': 'https://prod.spline.design/7Y5294MroVbAcrDZ/scene.splinecode',
      '6': 'https://prod.spline.design/MV5xDpbJlrjUbC1i/scene.splinecode',
      'default': 'https://prod.spline.design/awNJZxGj0cPIvpc7/scene.splinecode'
    };

    return sceneUrls[referralCode] || sceneUrls.default;
  };

  const handleLoad = (spline: Application) => {
    try {
      splineRef.current = spline;
      // Type assertion for accessing runtime properties that may not be in the type definition
      const splineWithRuntime = spline as Application & { 
        runtime?: { orbitControls?: { enableZoom: boolean } } 
      };
      if (splineWithRuntime?.runtime?.orbitControls) {
        splineWithRuntime.runtime.orbitControls.enableZoom = false;
      }
      setIsLoading(false);
      onAnimationComplete?.();
    } catch (error) {
      console.error('Error loading Spline:', error);
      setHasError(true);
    }
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#001118]/80">
          <div className="text-[#59ff83] animate-pulse">Loading animation...</div>
        </div>
      )}
      
      <Suspense fallback={null}>
        {!hasError ? (
          <Spline
            scene={getSplineSceneUrl()}
            onLoad={handleLoad}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[#59ff83]">
            Failed to load animation
          </div>
        )}
      </Suspense>
    </div>
  );
}; 