import { useState, useCallback } from 'react';
import { CuestionarioResponse, Cuestionario } from '../types/cuestionario';
import { submitResponse as submitToBackend } from '../services/responseService';
import { RespondentInfo, AdministratorInfo } from '../services/cuestionarioService';

interface UseSubmitResponseReturn {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  submitResponse: (response: CuestionarioResponse, tokenId: string, cuestionario: Cuestionario, respondent?: RespondentInfo | null, administrator?: AdministratorInfo | null) => Promise<string | null>;
  reset: () => void;
}

export function useSubmitResponse(): UseSubmitResponseReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitResponse = useCallback(
    async (response: CuestionarioResponse, tokenId: string, cuestionario: Cuestionario, respondent?: RespondentInfo | null, administrator?: AdministratorInfo | null): Promise<string | null> => {
      try {
        setIsSubmitting(true);
        setError(null);

        const responseId = await submitToBackend(response, tokenId, cuestionario, respondent, administrator);

        setIsSuccess(true);
        return responseId;
      } catch (err) {
        console.error('Error submitting response:', err);
        setError('Error al enviar las respuestas.');
        return null;
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
