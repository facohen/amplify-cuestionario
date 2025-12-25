import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfettiCelebration from '../components/gamification/ConfettiCelebration';
import BadgeIcon from '../components/gamification/BadgeIcon';
import FeedbackQuestions, { FeedbackResult, AbandonFeedbackResult } from '../components/feedback/FeedbackQuestions';
import { getEarnedBadges } from '../data/badges';
import { submitFeedback, submitAbandonWithFeedback } from '../services/cuestionarioService';

interface LocationState {
  totalTime?: number;
  totalQuestions?: number;
  responseId?: string | null;
  isAbandoned?: boolean;
  abandonedAtQuestion?: number;
}

export default function CompletedScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [showConfetti, setShowConfetti] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const isAbandoned = state?.isAbandoned ?? false;
  const feedbackMode = isAbandoned ? 'abandon' : 'complete';

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

  async function handleFeedbackSubmit(data: FeedbackResult | AbandonFeedbackResult) {
    setIsSubmitting(true);

    try {
      if (state?.responseId) {
        if (isAbandoned && 'abandonReason' in data) {
          await submitAbandonWithFeedback(
            state.responseId,
            state.abandonedAtQuestion || 0,
            data
          );
        } else if ('easeOfUse' in data && 'surveyLength' in data && 'willingToReceive' in data) {
          await submitFeedback(state.responseId, data as FeedbackResult);
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }

    setIsSubmitting(false);
    setFeedbackSubmitted(true);
    setShowFeedback(false);
  }

  return (
    <div className="min-h-screen bg-gradient-questionnaire flex items-center justify-center p-4">
      {!isAbandoned && <ConfettiCelebration isActive={showConfetti} />}

      <Card className="max-w-md w-full text-center relative z-10">
        <AnimatePresence mode="wait">
          {showFeedback ? (
            <FeedbackQuestions
              key="feedback"
              mode={feedbackMode}
              onSubmit={handleFeedbackSubmit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              {/* Trophy celebration or X for abandon */}
              <motion.div
                className="text-7xl mb-4"
                animate={isAbandoned ? {} : {
                  y: [0, -10, 0],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                {isAbandoned ? '😔' : '🏆'}
              </motion.div>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-accent-orange bg-clip-text text-transparent mb-4">
                {isAbandoned ? 'Entendemos' : 'Felicitaciones!'}
              </h1>

              <p className="text-xl text-gray-700 mb-6">
                {isAbandoned
                  ? 'No hay problema. Agradecemos tu tiempo.'
                  : 'Has completado el cuestionario exitosamente'}
              </p>

              {/* Stats */}
              {totalTimeSeconds > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {isAbandoned ? 'Preguntas respondidas' : 'Total preguntas'}
                      </p>
                      <p className="text-2xl font-bold text-primary-purple">
                        {isAbandoned ? state?.abandonedAtQuestion : state?.totalQuestions}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tiempo total</p>
                      <p className="text-2xl font-bold text-primary-purple">
                        {totalMinutes > 0 && `${totalMinutes}m `}
                        {remainingSeconds}s
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Earned badges (only for completed) */}
              {!isAbandoned && earnedBadges.length > 0 && (
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

              {/* Celebration emojis (only for completed) */}
              {!isAbandoned && (
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
              )}

              <p className="text-gray-600 mb-6">
                {feedbackSubmitted
                  ? 'Gracias por tu feedback. Tus respuestas han sido registradas.'
                  : isAbandoned
                    ? 'Nos ayudaría mucho conocer tu opinión antes de irte.'
                    : 'Gracias por tu participacion. Tus respuestas han sido registradas.'}
              </p>

              {!feedbackSubmitted && state?.responseId && (
                <Button
                  onClick={() => setShowFeedback(true)}
                  variant="primary"
                  fullWidth
                  className="mb-3"
                >
                  {isAbandoned ? 'Dar feedback' : 'Dar feedback (opcional)'}
                </Button>
              )}

              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                fullWidth
              >
                Volver al inicio
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
