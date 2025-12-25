export type TokenStatus = 'active' | 'used' | 'expired' | 'revoked';

export interface Token {
  id: string;
  cuestionarioId: string;
  createdAt: string;
  expiresAt?: string | null;
  usedAt?: string | null;
  status: TokenStatus;
  // Datos del respondente (para carga asistida)
  respondentName?: string | null;
  respondentEmail?: string | null;
  respondentCuil?: string | null;
  isAssistedEntry?: boolean | null;
  createdBy?: string | null;
}

export interface RespondentData {
  name: string;
  email: string;
  cuil: string;
}

export interface TokenValidationResult {
  valid: boolean;
  token?: Token;
  message: string;
}
