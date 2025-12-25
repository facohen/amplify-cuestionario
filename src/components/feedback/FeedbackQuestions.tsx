import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const EMOJI_OPTIONS = [
  { value: 1, emoji: '😫', label: 'Muy difícil' },
  { value: 2, emoji: '😕', label: 'Difícil' },
  { value: 3, emoji: '😐', label: 'Normal' },
  { value: 4, emoji: '🙂', label: 'Fácil' },
  { value: 5, emoji: '😊', label: 'Muy fácil' },
];

const LENGTH_OPTIONS = [
  { value: 1, emoji: '😊', label: 'Muy corto' },
  { value: 2, emoji: '🙂', label: 'Corto' },
  { value: 3, emoji: '😐', label: 'Adecuado' },
  { value: 4, emoji: '😕', label: 'Largo' },
  { value: 5, emoji: '😫', label: 'Muy largo' },
];

const ABANDON_REASONS = [
  { value: 'too_long', label: 'Muy extenso' },
  { value: 'too_difficult', label: 'Muy difícil' },
  { value: 'no_share_info', label: 'No quiero dar esta información' },
  { value: 'no_time', label: 'No tengo tiempo' },
  { value: 'other', label: 'Otro motivo' },
];

export interface FeedbackResult {
  easeOfUse: number;
  surveyLength: number;
  willingToReceive: boolean;
}

export interface AbandonFeedbackResult {
  abandonReason: string;
  easeOfUse?: number;
  surveyLength?: number;
  willingToReceive?: boolean;
}

interface FeedbackQuestionsProps {
  mode: 'complete' | 'abandon';
  onSubmit: (data: FeedbackResult | AbandonFeedbackResult) => void;
  isSubmitting?: boolean;
}

export default function FeedbackQuestions({ mode, onSubmit, isSubmitting = false }: FeedbackQuestionsProps) {
  const [abandonReason, setAbandonReason] = useState<string | null>(null);
  const [easeOfUse, setEaseOfUse] = useState<number | null>(null);
  const [surveyLength, setSurveyLength] = useState<number | null>(null);
  const [willingToReceive, setWillingToReceive] = useState<boolean | null>(null);

  const canSubmitComplete = easeOfUse !== null && surveyLength !== null && willingToReceive !== null;
  const canSubmitAbandon = abandonReason !== null;

  function handleSubmit() {
    if (mode === 'complete' && canSubmitComplete) {
      onSubmit({
        easeOfUse: easeOfUse!,
        surveyLength: surveyLength!,
        willingToReceive: willingToReceive!,
      });
    } else if (mode === 'abandon' && canSubmitAbandon) {
      onSubmit({
        abandonReason: abandonReason!,
        easeOfUse: easeOfUse ?? undefined,
        surveyLength: surveyLength ?? undefined,
        willingToReceive: willingToReceive ?? undefined,
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {mode === 'abandon' ? 'Antes de irte...' : 'Cuéntanos tu experiencia'}
      </h2>

      {/* Motivo de abandono (solo en modo abandon) */}
      {mode === 'abandon' && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            ¿Por qué deseas abandonar el cuestionario?
          </p>
          <div className="space-y-2">
            {ABANDON_REASONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setAbandonReason(option.value)}
                className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                  abandonReason === option.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pregunta 1: Facilidad */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">
          ¿Qué tan fácil te resultó {mode === 'abandon' ? 'el cuestionario' : 'completarlo'}?
        </p>
        <div className="flex justify-center gap-2">
          {EMOJI_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setEaseOfUse(option.value)}
              className={`p-3 rounded-xl transition-all ${
                easeOfUse === option.value
                  ? 'bg-purple-100 scale-110 ring-2 ring-purple-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              title={option.label}
            >
              <span className="text-2xl">{option.emoji}</span>
            </button>
          ))}
        </div>
        {easeOfUse && (
          <p className="text-xs text-purple-600 mt-1">
            {EMOJI_OPTIONS.find(o => o.value === easeOfUse)?.label}
          </p>
        )}
      </div>

      {/* Pregunta 2: Extensión */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">
          ¿Te pareció que el cuestionario fue muy extenso?
        </p>
        <div className="flex justify-center gap-2">
          {LENGTH_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSurveyLength(option.value)}
              className={`p-3 rounded-xl transition-all ${
                surveyLength === option.value
                  ? 'bg-purple-100 scale-110 ring-2 ring-purple-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              title={option.label}
            >
              <span className="text-2xl">{option.emoji}</span>
            </button>
          ))}
        </div>
        {surveyLength && (
          <p className="text-xs text-purple-600 mt-1">
            {LENGTH_OPTIONS.find(o => o.value === surveyLength)?.label}
          </p>
        )}
      </div>

      {/* Pregunta 3: Propuestas */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">
          ¿Estarías dispuesto/a a recibir propuestas personalizadas?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setWillingToReceive(true)}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              willingToReceive === true
                ? 'bg-green-500 text-white scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sí
          </button>
          <button
            onClick={() => setWillingToReceive(false)}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              willingToReceive === false
                ? 'bg-red-500 text-white scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            No
          </button>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={(mode === 'complete' ? !canSubmitComplete : !canSubmitAbandon) || isSubmitting}
        variant="primary"
        size="lg"
        fullWidth
      >
        {isSubmitting ? 'Guardando...' : 'Finalizar'}
      </Button>

      {mode === 'abandon' && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Las preguntas de feedback son opcionales
        </p>
      )}
    </motion.div>
  );
}

export { ABANDON_REASONS };
