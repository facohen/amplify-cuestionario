import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FeedbackQuestions, { FeedbackResult, AbandonFeedbackResult } from '../components/feedback/FeedbackQuestions';
import { submitFeedback, submitAbandonWithFeedback } from '../services/cuestionarioService';

interface LocationState {
  totalTime?: number;
  totalQuestions?: number;
  respondentName?: string;
  responseId?: string | null;
  isAbandoned?: boolean;
  abandonedAtQuestion?: number;
}

export default function EncuestaGraciasScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [showMenu, setShowMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAbandoned = state?.isAbandoned ?? false;
  const feedbackMode = isAbandoned ? 'abandon' : 'complete';

  function formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

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

    navigate('/encuesta');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Menu hamburguesa oculto */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-4 right-4 p-2 text-white/30 hover:text-white/60 transition-colors"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Menu desplegable */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-4 bg-white rounded-lg shadow-xl overflow-hidden z-50"
          >
            <button
              onClick={() => navigate('/encuesta')}
              className="w-full px-6 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Volver al panel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center bg-white/95 backdrop-blur">
          <AnimatePresence mode="wait">
            {!showFeedback ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    isAbandoned
                      ? 'bg-gradient-to-br from-orange-400 to-red-500'
                      : 'bg-gradient-to-br from-green-400 to-emerald-600'
                  }`}
                >
                  {isAbandoned ? (
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-gray-800 mb-4"
                >
                  {isAbandoned ? 'Entendemos' : '¡Gracias!'}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-6"
                >
                  {isAbandoned ? (
                    state?.respondentName ? (
                      <>
                        <span className="font-semibold">{state.respondentName}</span>, no hay problema. Agradecemos tu tiempo.
                      </>
                    ) : (
                      'No hay problema. Agradecemos tu tiempo.'
                    )
                  ) : (
                    state?.respondentName ? (
                      <>
                        <span className="font-semibold">{state.respondentName}</span>, tu cuestionario ha sido completado exitosamente.
                      </>
                    ) : (
                      'El cuestionario ha sido completado exitosamente.'
                    )
                  )}
                </motion.p>

                {state?.totalTime && state?.totalQuestions && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-50 rounded-lg p-4 mb-6"
                  >
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {isAbandoned ? state.abandonedAtQuestion : state.totalQuestions}
                        </p>
                        <p className="text-sm text-gray-500">
                          {isAbandoned ? 'preguntas respondidas' : 'preguntas'}
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{formatTime(state.totalTime)}</p>
                        <p className="text-sm text-gray-500">tiempo total</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={() => setShowFeedback(true)}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    {isAbandoned ? 'Continuar' : 'Cerrar encuesta'}
                  </Button>
                  <p className="text-xs text-gray-400 mt-3">
                    {isAbandoned
                      ? 'Nos ayudaría mucho conocer tu opinión.'
                      : 'Antes de finalizar, nos gustaría hacerte unas preguntas rápidas.'}
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              <FeedbackQuestions
                mode={feedbackMode}
                onSubmit={handleFeedbackSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
