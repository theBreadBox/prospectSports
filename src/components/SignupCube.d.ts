import React from 'react';

declare const SignupCube: React.FC<{
  currentStep: number;
  signupComplete: boolean;
  onCubeClick?: () => void;
}>;

export default SignupCube; 