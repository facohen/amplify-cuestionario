import { useState, useCallback } from 'react';
import { CuestionarioResponse } from '../types/cuestionario';
import { submitResponse as submitToBackend } from '../services/responseService';

interface UseSubmitResponseReturn {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  submitResponse: (response: CuestionarioResponse, tokenId: string) => Promise<void>;
  reset: () => void;
}

export function useSubmitResponse(): UseSubmitResponseReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitResponse = useCallback(
    async (response: CuestionarioResponse, tokenId: string) => {
      try {
        setIsSubmitting(true);
        setError(null);

        await submitToBackend(response, tokenId);

        // Also save to localStorage as backup
        const responses = JSON.parse(localStorage.getItem('cuestionario_responses') || '[]');
        responses.push(response);
        localStorage.setItem('cuestionario_responses', JSON.stringify(responses));

        setIsSuccess(true);
      } catch (err) {
        console.error('Error submitting response:', err);
        setError('Error al enviar las respuestas. Se han guardado localmente.');

        // Save to localStorage even on error
        const responses = JSON.parse(localStorage.getItem('cuestionario_responses') || '[]');
        responses.push(response);
        localStorage.setItem('cuestionario_responses', JSON.stringify(responses));
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
