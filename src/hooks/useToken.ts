import { useState, useEffect, useCallback } from 'react';
import { Token, TokenValidationResult } from '../types/token';
import { validateToken, markTokenAsUsed } from '../services/tokenService';

interface UseTokenReturn {
  token: Token | null;
  isLoading: boolean;
  isValid: boolean;
  error: string | null;
  markAsUsed: () => Promise<void>;
}

export function useToken(tokenId: string | undefined): UseTokenReturn {
  const [token, setToken] = useState<Token | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validate() {
      if (!tokenId) {
        setIsLoading(false);
        setIsValid(false);
        setError('Token no proporcionado');
        return;
      }

      try {
        setIsLoading(true);
        const result: TokenValidationResult = await validateToken(tokenId);
        setToken(result.token || null);
        setIsValid(result.valid);
        setError(result.valid ? null : result.message);
      } catch (err) {
        setIsValid(false);
        setError('Error al validar el token');
        console.error('Token validation error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    validate();
  }, [tokenId]);

  const markAsUsed = useCallback(async () => {
    if (!tokenId || !token) return;

    try {
      await markTokenAsUsed(tokenId);
      setToken((prev) => (prev ? { ...prev, status: 'used', usedAt: new Date().toISOString() } : null));
    } catch (err) {
      console.error('Error marking token as used:', err);
      throw err;
    }
  }, [tokenId, token]);

  return {
    token,
    isLoading,
    isValid,
    error,
    markAsUsed,
  };
}
