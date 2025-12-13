import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfettiCelebration from '../components/gamification/ConfettiCelebration';
import BadgeIcon from '../components/gamification/BadgeIcon';
import { getEarnedBadges } from '../data/badges';

interface LocationState {
  totalTime?: number;
  totalQuestions?: number;
}

export default function CompletedScreen() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [showConfetti, setShowConfetti] = useState(true);

  const totalTimeSeconds = state?.totalTime ? Math.round(state.totalTime / 1000) : 0;
  const totalMinutes = Math.floor(totalTimeSeconds / 60);
  const remainingSeconds = totalTimeSeconds % 60;

  const earnedBadges = getEarnedBadges(state?.totalQuestions || 54);

  useEffect(() => {
    // Keep confetti running for 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-questionnaire flex items-center justify-center p-4">
      <ConfettiCelebration isActive={showConfetti} />

      <Card className="max-w-md w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          {/* Trophy celebration */}
          <motion.div
            className="text-7xl mb-4"
            animate={{
              y: [0, -10, 0],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            🏆
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-accent-orange bg-clip-text text-transparent mb-4">
            Felicitaciones!
          </h1>

          <p className="text-xl text-gray-700 mb-6">
            Has completado el cuestionario exitosamente
          </p>

          {/* Stats */}
          {totalTimeSeconds > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Tiempo total</p>
              <p className="text-2xl font-bold text-primary-purple">
                {totalMinutes > 0 && `${totalMinutes}m `}
                {remainingSeconds}s
              </p>
            </div>
          )}

          {/* Earned badges */}
          {earnedBadges.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">Insignias obtenidas</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {earnedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    title={badge.name}
                  >
                    <BadgeIcon icon={badge.icon} size="sm" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Celebration emojis */}
          <motion.div
            className="flex justify-center gap-3 text-3xl mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {['🎉', '⭐', '🎊', '✨', '🌟'].map((emoji, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>

          <p className="text-gray-600 mb-6">
            Gracias por tu participacion. Tus respuestas han sido registradas.
          </p>

          <Link to="/">
            <Button variant="secondary">Volver al inicio</Button>
          </Link>
        </motion.div>
      </Card>
    </div>
  );
}
