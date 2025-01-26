// hooks/useConfettiWithImage.js
import { useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';

const useConfettiWithImages = (imageSrc) => {
  const imageRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
    };
  }, [imageSrc]);

  const fireConfetti = useCallback((x, y) => {
    if (!imageRef.current) return;

    const myConfetti = confetti.create(null, {
      resize: true,
      useWorker: false,  // Disable worker to use custom drawShape function
    });

    myConfetti({
      particleCount: 100,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
      shapes: ['customImage'],
      drawShape: (ctx) => {
        ctx.drawImage(imageRef.current, -10, -10, 20, 20);
      },
    });
  }, []);

  return fireConfetti;
};

export default useConfettiWithImages;
