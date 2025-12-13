import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { CuestionarioResponse } from '../types/cuestionario';

const client = generateClient<Schema>();

export async function submitResponse(
  response: CuestionarioResponse,
  tokenId: string
): Promise<void> {
  try {
    const { errors } = await client.models.CuestionarioResponse.create({
      tokenId,
      cuestionarioId: response.cuestionario_id,
      cuestionarioVersion: response.cuestionario_version,
      startedAt: response.started_at,
      finishedAt: response.finished_at,
      totalTimeMs: response.total_time_ms,
      answersJson: JSON.stringify(response.answers),
      status: 'completed',
    });

    if (errors) {
      console.error('Errors creating response:', errors);
      throw new Error('Failed to submit response');
    }

    console.log('Response submitted successfully');
  } catch (error) {
    console.error('Error submitting response:', error);
    throw error;
  }
}

export async function getResponseByToken(tokenId: string): Promise<CuestionarioResponse | null> {
  try {
    const { data: responses, errors } = await client.models.CuestionarioResponse.list({
      filter: {
        tokenId: { eq: tokenId },
      },
    });

    if (errors || !responses || responses.length === 0) {
      return null;
    }

    const response = responses[0];
    return {
      response_id: response.id,
      cuestionario_id: response.cuestionarioId,
      cuestionario_version: response.cuestionarioVersion,
      started_at: response.startedAt,
      finished_at: response.finishedAt || '',
      total_time_ms: response.totalTimeMs || 0,
      answers: JSON.parse(response.answersJson as string || '[]'),
    };
  } catch (error) {
    console.error('Error getting response:', error);
    return null;
  }
}

export async function listResponses(): Promise<CuestionarioResponse[]> {
  try {
    const { data: responses, errors } = await client.models.CuestionarioResponse.list();

    if (errors) {
      throw new Error('Failed to list responses');
    }

    return responses.map((response) => ({
      response_id: response.id,
      cuestionario_id: response.cuestionarioId,
      cuestionario_version: response.cuestionarioVersion,
      started_at: response.startedAt,
      finished_at: response.finishedAt || '',
      total_time_ms: response.totalTimeMs || 0,
      answers: JSON.parse(response.answersJson as string || '[]'),
    }));
  } catch (error) {
    console.error('Error listing responses:', error);
    throw error;
  }
}
