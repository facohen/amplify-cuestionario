import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Token, TokenValidationResult, RespondentData } from '../types/token';
import { withGraphQLRetry } from '../utils/retry';

// Cliente para operaciones autenticadas (admin)
const authClient = generateClient<Schema>({ authMode: 'userPool' });

// Cliente para operaciones públicas (validación de token)
const publicClient = generateClient<Schema>({ authMode: 'apiKey' });

// Batch size for parallel token creation (avoid overwhelming the API)
const BATCH_SIZE = 10;

export async function validateToken(tokenId: string): Promise<TokenValidationResult> {
  try {
    const { data: token, errors } = await withGraphQLRetry(() =>
      publicClient.models.Token.get({ id: tokenId })
    );

    if (errors || !token) {
      return {
        valid: false,
        message: 'Token no encontrado',
      };
    }

    // Check if already used
    if (token.status === 'used') {
      return {
        valid: false,
        token: mapToken(token),
        message: 'Este token ya ha sido utilizado',
      };
    }

    // Check if expired
    if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
      return {
        valid: false,
        token: mapToken(token),
        message: 'Este token ha expirado',
      };
    }

    // Check if revoked
    if (token.status === 'revoked') {
      return {
        valid: false,
        token: mapToken(token),
        message: 'Este token ha sido revocado',
      };
    }

    return {
      valid: true,
      token: mapToken(token),
      message: 'Token valido',
    };
  } catch (error) {
    console.error('Error validating token:', error);
    return {
      valid: false,
      message: 'Error al validar el token',
    };
  }
}

export async function markTokenAsUsed(tokenId: string): Promise<void> {
  await withGraphQLRetry(async () => {
    const result = await publicClient.models.Token.update({
      id: tokenId,
      status: 'used',
      usedAt: new Date().toISOString(),
    });
    if (result.errors) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }
    return result;
  });
}

export async function createToken(cuestionarioId: string, expiresAt?: string): Promise<Token> {
  const { data: token, errors } = await withGraphQLRetry(() =>
    authClient.models.Token.create({
      cuestionarioId,
      status: 'active',
      expiresAt: expiresAt || null,
    })
  );

  if (errors || !token) {
    console.error('Create token errors:', errors);
    throw new Error('Failed to create token');
  }

  return mapToken(token);
}

export async function createAssistedToken(
  cuestionarioId: string,
  respondent: RespondentData,
  createdBy: string
): Promise<Token> {
  const { data: token, errors } = await withGraphQLRetry(() =>
    authClient.models.Token.create({
      cuestionarioId,
      status: 'active',
      respondentName: respondent.name,
      respondentEmail: respondent.email,
      respondentCuil: respondent.cuil,
      isAssistedEntry: true,
      createdBy,
    })
  );

  if (errors || !token) {
    console.error('Create assisted token errors:', errors);
    throw new Error('Failed to create assisted token');
  }

  return mapToken(token);
}

export async function getTokenById(tokenId: string): Promise<Token | null> {
  const { data: token, errors } = await withGraphQLRetry(() =>
    publicClient.models.Token.get({ id: tokenId })
  );

  if (errors || !token) {
    return null;
  }

  return mapToken(token);
}

/**
 * Create multiple tokens in parallel batches
 * Uses Promise.all with batch size to avoid overwhelming the API
 */
export async function createTokensBatch(
  cuestionarioId: string,
  count: number,
  expiresAt?: string
): Promise<Token[]> {
  const tokens: Token[] = [];

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, count - i);
    const batchPromises = Array.from({ length: batchSize }, () =>
      createToken(cuestionarioId, expiresAt)
    );

    const batchResults = await Promise.all(batchPromises);
    tokens.push(...batchResults);
  }

  return tokens;
}

export async function listTokens(
  status?: 'active' | 'used' | 'expired' | 'revoked'
): Promise<Token[]> {
  const { data: tokens, errors } = await withGraphQLRetry(() =>
    authClient.models.Token.list()
  );

  if (errors) {
    console.error('List tokens errors:', errors);
    throw new Error('Failed to list tokens');
  }

  let result = tokens.map(mapToken);

  if (status) {
    result = result.filter((t) => t.status === status);
  }

  return result;
}

export async function revokeToken(tokenId: string): Promise<void> {
  await withGraphQLRetry(async () => {
    const result = await authClient.models.Token.update({
      id: tokenId,
      status: 'revoked',
    });
    if (result.errors) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }
    return result;
  });
}

// Helper function to map DynamoDB response to Token type
function mapToken(dbToken: NonNullable<Awaited<ReturnType<typeof publicClient.models.Token.get>>['data']>): Token {
  return {
    id: dbToken.id,
    cuestionarioId: dbToken.cuestionarioId,
    createdAt: dbToken.createdAt,
    expiresAt: dbToken.expiresAt,
    usedAt: dbToken.usedAt,
    status: dbToken.status as Token['status'],
    respondentName: dbToken.respondentName,
    respondentEmail: dbToken.respondentEmail,
    respondentCuil: dbToken.respondentCuil,
    isAssistedEntry: dbToken.isAssistedEntry,
    createdBy: dbToken.createdBy,
  };
}
