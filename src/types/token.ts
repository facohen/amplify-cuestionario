export type TokenStatus = 'active' | 'used' | 'expired' | 'revoked';

export interface Token {
  id: string;
  cuestionarioId: string;
  createdAt: string;
  expiresAt?: string | null;
  usedAt?: string | null;
  status: TokenStatus;
}

export interface TokenValidationResult {
  valid: boolean;
  token?: Token;
  message: string;
}
