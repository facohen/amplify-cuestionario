import { useState, useCallback } from 'react';
import { CuestionarioResponse, Cuestionario } from '../types/cuestionario';
import { submitResponse as submitToBackend } from '../services/responseService';

interface UseSubmitResponseReturn {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  submitResponse: (response: CuestionarioResponse, tokenId: string, cuestionario: Cuestionario) => Promise<void>;
  reset: () => void;
}

export function useSubmitResponse(): UseSubmitResponseReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitResponse = useCallback(
    async (response: CuestionarioResponse, tokenId: string, cuestionario: Cuestionario) => {
      try {
        setIsSubmitting(true);
        setError(null);

        await submitToBackend(response, tokenId, cuestionario);

        setIsSuccess(true);
      } catch (err) {
        console.error('Error submitting response:', err);
        setError('Error al enviar las respuestas.');
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  return {
    isSubmitting,
    isSuccess,
    error,
    submitResponse,
    reset,
  };
}
