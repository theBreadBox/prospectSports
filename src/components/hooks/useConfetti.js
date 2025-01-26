import confetti from 'canvas-confetti';

const useConfetti = (images) => {
  const fireConfetti = (x, y) => {
    confetti({
      particleCount: 100,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight
      }
    });
  };

  return fireConfetti;
};

export default useConfetti;