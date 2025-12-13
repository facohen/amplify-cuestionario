import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface ConfettiCelebrationProps {
  isActive: boolean;
  duration?: number;
}

export default function ConfettiCelebration({
  isActive,
  duration = 5000,
}: ConfettiCelebrationProps) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [numberOfPieces, setNumberOfPieces] = useState(200);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isActive) {
      setShowConfetti(true);
      setNumberOfPieces(200);

      // Gradually reduce confetti
      const fadeTimer = setTimeout(() => {
        setNumberOfPieces(0);
      }, duration - 1000);

      // Hide completely after duration
      const hideTimer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isActive, duration]);

  if (!showConfetti) return null;

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      numberOfPieces={numberOfPieces}
      recycle={false}
      colors={[
        '#d946ef', // primary purple
        '#f97316', // accent orange
        '#22c55e', // green
        '#eab308', // yellow
        '#3b82f6', // blue
        '#ec4899', // pink
      ]}
      gravity={0.3}
      tweenDuration={5000}
    />
  );
}
