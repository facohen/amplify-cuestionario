import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cuestionario, AnswerMetrics, CuestionarioResponse } from '../types/cuestionario';
import { useToken } from '../hooks/useToken';
import { useGameProgress } from '../hooks/useGameProgress';
import { useSubmitResponse } from '../hooks/useSubmitResponse';
import { downloadCuestionario } from '../services/cuestionarioStorageService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BadgeModal from '../components/gamification/BadgeModal';
import BadgeIcon from '../components/gamification/BadgeIcon';
import { getEarnedBadges } from '../data/badges';

type ScreenState = 'loading' | 'welcome' | 'questionnaire' | 'submitting';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function QuestionnaireScreen() {
  const { token: tokenId } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // Token validation
  const { isLoading: tokenLoading, isValid, token, error: tokenError, markAsUsed } = useToken(tokenId);

  // Game progress
  const { currentBadge, showBadgeModal, checkForBadge, closeBadgeModal } =
    useGameProgress();

  // Response submission
  const { isSubmitting, submitResponse } = useSubmitResponse();

  // Screen state
  const [screenState, setScreenState] = useState<ScreenState>('loading');

  // Cuestionario data loaded from S3
  const [cuestionarioData, setCuestionarioData] = useState<Cuestionario | null>(null);

  // Questionnaire state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerMetrics[]>([]);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Tracking refs
  const questionStartTime = useRef<number>(Date.now());
  const changeCount = useRef<number>(0);
  const firstSelection = useRef<string | null>(null);

  const question = cuestionarioData?.questions[currentQuestion];
  const isLastQuestion = cuestionarioData ? currentQuestion === cuestionarioData.questions.length - 1 : false;
  const currentEarnedBadges = getEarnedBadges(currentQuestion);

  // Handle token validation result and load cuestionario
  useEffect(() => {
    async function loadCuestionario() {
      if (!tokenLoading && isValid && token) {
        try {
          const data = await downloadCuestionario(token.cuestionarioId);
          if (data) {
            setCuestionarioData(data);
            setScreenState('welcome');
          } else {
            navigate('/invalid?reason=not_found');
          }
        } catch (error) {
          console.error('Error loading cuestionario:', error);
          navigate('/invalid?reason=error');
        }
      } else if (!tokenLoading && !isValid) {
        // Redirect to invalid token page with reason
        const reason = tokenError?.includes('utilizado')
          ? 'used'
          : tokenError?.includes('expirado')
          ? 'expired'
          : tokenError?.includes('revocado')
          ? 'revoked'
          : 'invalid';
        navigate(`/invalid?reason=${reason}`);
      }
    }

    loadCuestionario();
  }, [tokenLoading, isValid, token, tokenError, navigate]);

  // Reset question tracking when question changes
  useEffect(() => {
    questionStartTime.current = Date.now();
    changeCount.current = 0;
    firstSelection.current = null;
  }, [currentQuestion]);

  function handleStart() {
    setStartedAt(new Date().toISOString());
    setScreenState('questionnaire');
  }

  function handleOptionSelect(optionKey: string) {
    if (firstSelection.current === null) {
      firstSelection.current = optionKey;
    } else if (selectedOption !== optionKey) {
      changeCount.current += 1;
    }
    setSelectedOption(optionKey);
  }

  async function handleNext() {
    if (selectedOption === null || !question) return;

    const timeToAnswer = Date.now() - questionStartTime.current;
    const answerMetrics: AnswerMetrics = {
      question_number: question.question_number,
      selected_option: selectedOption,
      time_to_answer_ms: timeToAnswer,
      changed_answer: changeCount.current > 0,
      change_count: changeCount.current,
    };

    const newAnswers = [...answers, answerMetrics];
    setAnswers(newAnswers);

    // Check for badge at current question number
    checkForBadge(currentQuestion + 1);

    if (isLastQuestion) {
      await handleComplete(newAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  }

  async function handleComplete(finalAnswers: AnswerMetrics[]) {
    if (!cuestionarioData) return;

    setScreenState('submitting');

    const finishedAt = new Date().toISOString();
    const totalTime = Date.now() - new Date(startedAt!).getTime();

    const response: CuestionarioResponse = {
      response_id: generateId(),
      cuestionario_id: cuestionarioData.id_cuestionario,
      cuestionario_version: cuestionarioData.version,
      started_at: startedAt!,
      finished_at: finishedAt,
      total_time_ms: totalTime,
      answers: finalAnswers,
    };

    try {
      await submitResponse(response, tokenId!);
      await markAsUsed();
      navigate('/completed', {
        state: {
          totalTime,
          totalQuestions: cuestionarioData.total_questions,
        },
      });
    } catch (error) {
      console.error('Error completing questionnaire:', error);
      // Still navigate to completed even if backend fails (localStorage backup)
      navigate('/completed', {
        state: {
          totalTime,
          totalQuestions: cuestionarioData.total_questions,
        },
      });
    }
  }

  // Loading state
  if (screenState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-questionnaire flex items-center justify-center">
        <Card className="text-center p-8">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Validando acceso...</p>
        </Card>
      </div>
    );
  }

  // Welcome state
  if (screenState === 'welcome' && cuestionarioData) {
    return (
      <div className="min-h-screen bg-gradient-questionnaire flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-6">🎯</div>

            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {cuestionarioData.title}
            </h1>

            <p className="text-gray-600 mb-6">{cuestionarioData.description}</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-500 mb-2">Informacion:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>📝 {cuestionarioData.total_questions} preguntas</li>
                <li>⏱️ Tiempo estimado: 10-15 minutos</li>
                <li>🏆 Gana insignias mientras avanzas</li>
              </ul>
            </div>

            <Button onClick={handleStart} variant="primary" size="lg" fullWidth>
              Comenzar Cuestionario
            </Button>
          </motion.div>
        </Card>
      </div>
    );
  }

  // Submitting state
  if (screenState === 'submitting' || isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-questionnaire flex items-center justify-center">
        <Card className="text-center p-8">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Guardando respuestas...</p>
        </Card>
      </div>
    );
  }

  // Questionnaire state - ensure we have data
  if (!cuestionarioData || !question) {
    return (
      <div className="min-h-screen bg-gradient-questionnaire flex items-center justify-center">
        <Card className="text-center p-8">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Cargando cuestionario...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      {/* Badge modal */}
      <BadgeModal
        badge={currentBadge}
        isOpen={showBadgeModal}
        onClose={closeBadgeModal}
      />

      <div className="w-full max-w-lg">
        {/* Title */}
        <motion.h1
          className="text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-orange-500 bg-clip-text text-transparent text-center mb-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {cuestionarioData.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-sm text-gray-600 text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Avancemos 😉 Acompáñanos en este recorrido por tus preferencias 👌 para poder ofrecerte una experiencia diseñada a tu medida 🤝
        </motion.p>

        {/* Progress section */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProgressBar
            current={currentQuestion + 1}
            total={cuestionarioData.total_questions}
          />

          {/* Earned badges display */}
          {currentEarnedBadges.length > 0 && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-gradient-to-r from-fuchsia-50 to-orange-50 rounded-lg border border-fuchsia-200">
              <span className="text-xs font-semibold text-fuchsia-600">Insignias Logradas:</span>
              <div className="flex gap-1">
                {currentEarnedBadges.map((badge) => (
                  <BadgeIcon
                    key={badge.id}
                    icon={badge.icon}
                    size="sm"
                    className="w-6 h-6"
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Card className="mb-4 border-2 border-fuchsia-400">
              <h2 className="text-lg font-bold text-fuchsia-600 mb-6">
                {question.text}
              </h2>

              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option.option_key}
                    onClick={() => handleOptionSelect(option.option_key)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      selectedOption === option.option_key
                        ? 'border-fuchsia-500 bg-gradient-to-r from-fuchsia-500 to-orange-400 text-white shadow-lg scale-[1.02]'
                        : 'border-fuchsia-300 hover:border-fuchsia-400 hover:bg-fuchsia-50'
                    }`}
                  >
                    <span
                      className={`font-bold ${
                        selectedOption === option.option_key
                          ? 'text-white'
                          : 'text-fuchsia-600'
                      }`}
                    >
                      {option.option_key}.
                    </span>{' '}
                    <span className={selectedOption === option.option_key ? 'text-white' : 'text-gray-700'}>
                      {option.option_text}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Next/Submit button */}
        <div>
          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            variant="primary"
            size="lg"
            fullWidth
          >
            {isLastQuestion ? 'Finalizar' : 'Avanzar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
