import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Token, TokenValidationResult } from '../types/token';

// Cliente para operaciones autenticadas (admin)
const authClient = generateClient<Schema>({ authMode: 'userPool' });

// Cliente para operaciones públicas (validación de token)
const publicClient = generateClient<Schema>({ authMode: 'apiKey' });

export async function validateToken(tokenId: string): Promise<TokenValidationResult> {
  try {
    const { data: token, errors } = await publicClient.models.Token.get({ id: tokenId });

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
  try {
    await publicClient.models.Token.update({
      id: tokenId,
      status: 'used',
      usedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking token as used:', error);
    throw error;
  }
}

export async function createToken(cuestionarioId: string, expiresAt?: string): Promise<Token> {
  try {
    const { data: token, errors } = await authClient.models.Token.create({
      cuestionarioId,
      status: 'active',
      expiresAt: expiresAt || null,
    });

    if (errors || !token) {
      console.error('Create token errors:', errors);
      throw new Error('Failed to create token');
    }

    return mapToken(token);
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

export async function createTokensBatch(
  cuestionarioId: string,
  count: number,
  expiresAt?: string
): Promise<Token[]> {
  const tokens: Token[] = [];

  for (let i = 0; i < count; i++) {
    const token = await createToken(cuestionarioId, expiresAt);
    tokens.push(token);
  }

  return tokens;
}

export async function listTokens(
  status?: 'active' | 'used' | 'expired' | 'revoked'
): Promise<Token[]> {
  try {
    const { data: tokens, errors } = await authClient.models.Token.list();

    if (errors) {
      console.error('List tokens errors:', errors);
      throw new Error('Failed to list tokens');
    }

    let result = tokens.map(mapToken);

    if (status) {
      result = result.filter((t) => t.status === status);
    }

    return result;
  } catch (error) {
    console.error('Error listing tokens:', error);
    throw error;
  }
}

export async function revokeToken(tokenId: string): Promise<void> {
  try {
    await authClient.models.Token.update({
      id: tokenId,
      status: 'revoked',
    });
  } catch (error) {
    console.error('Error revoking token:', error);
    throw error;
  }
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
  };
}
