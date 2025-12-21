import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Cuestionario, CuestionarioResponse, CuestionarioStatus, AnswerMetrics, Question } from '../types/cuestionario';

const client = generateClient<Schema>();

// Constantes para el ajuste de tiempo por badges
const BADGE_POPUP_DURATION_MS = 4000;
const BADGE_QUESTION_NUMBERS = [11, 21, 31, 41, 51];

// ============ TIPOS ============

export interface EnrichedAnswer {
  question_number: number;
  question_text: string;
  selected_option_key: string;
  selected_option_text: string;
  time_to_answer_ms: number;
  time_adjusted_ms: number;
  changed_answer: boolean;
  change_count: number;
  had_badge_popup: boolean;
}

export interface StoredResponseData {
  id: string;
  tokenId: string;
  cuestionarioId: string;
  cuestionarioVersion: string;
  cuestionarioTitle: string | null;
  startedAt: string;
  finishedAt: string | null;
  totalTimeMs: number | null;
  totalTimeAdjustedMs: number | null;
  answersJson: EnrichedAnswer[];
  status: 'in_progress' | 'completed' | 'abandoned';
  downloadStatus: 'pending' | 'downloaded';
  downloadedAt: string | null;
  downloadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============ CUESTIONARIOS ============

export async function createCuestionario(cuestionario: Cuestionario): Promise<string> {
  const result = await client.models.CuestionarioDefinition.create({
    id: cuestionario.id_cuestionario,
    version: cuestionario.version,
    title: cuestionario.title,
    description: cuestionario.description,
    totalQuestions: cuestionario.total_questions,
    creadoPor: cuestionario.creado_por,
    status: cuestionario.status || 'draft',
    questionsJson: cuestionario.questions,
  });

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  console.log('Cuestionario created:', result.data?.id);
  return result.data?.id || cuestionario.id_cuestionario;
}

export async function listCuestionarios(): Promise<Cuestionario[]> {
  const result = await client.models.CuestionarioDefinition.list();

  if (result.errors) {
    console.error('Error listing cuestionarios:', result.errors);
    return [];
  }

  return (result.data || []).map(item => ({
    id_cuestionario: item.id,
    version: item.version,
    title: item.title,
    description: item.description || '',
    total_questions: item.totalQuestions,
    creado_por: item.creadoPor || '',
    status: (item.status as CuestionarioStatus) || 'draft',
    questions: (item.questionsJson as Question[]) || [],
  }));
}

export async function getCuestionario(id: string): Promise<Cuestionario | null> {
  const result = await client.models.CuestionarioDefinition.get({ id });

  if (result.errors || !result.data) {
    console.error('Error getting cuestionario:', result.errors);
    return null;
  }

  const item = result.data;
  return {
    id_cuestionario: item.id,
    version: item.version,
    title: item.title,
    description: item.description || '',
    total_questions: item.totalQuestions,
    creado_por: item.creadoPor || '',
    status: (item.status as CuestionarioStatus) || 'draft',
    questions: (item.questionsJson as Question[]) || [],
  };
}

export async function getActiveCuestionario(): Promise<Cuestionario | null> {
  const result = await client.models.CuestionarioDefinition.list({
    filter: { status: { eq: 'active' } },
  });

  if (result.errors || !result.data?.length) {
    console.error('Error getting active cuestionario:', result.errors);
    return null;
  }

  const item = result.data[0];
  return {
    id_cuestionario: item.id,
    version: item.version,
    title: item.title,
    description: item.description || '',
    total_questions: item.totalQuestions,
    creado_por: item.creadoPor || '',
    status: 'active',
    questions: (item.questionsJson as Question[]) || [],
  };
}

export async function updateCuestionarioStatus(id: string, status: CuestionarioStatus): Promise<void> {
  console.log('updateCuestionarioStatus:', id, status);

  const result = await client.models.CuestionarioDefinition.update({
    id,
    status,
  });

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  console.log('Cuestionario status updated:', id, status);
}

export async function deleteCuestionario(id: string): Promise<void> {
  const result = await client.models.CuestionarioDefinition.delete({ id });

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  console.log('Cuestionario deleted:', id);
}

// ============ RESPUESTAS ============

function enrichAnswers(answers: AnswerMetrics[], cuestionario: Cuestionario): EnrichedAnswer[] {
  return answers.map((answer) => {
    const question = cuestionario.questions.find(
      (q) => q.question_number === answer.question_number
    );

    const selectedOption = question?.options.find(
      (o) => o.option_key === answer.selected_option
    );

    const hadBadgePopup = BADGE_QUESTION_NUMBERS.includes(answer.question_number);
    const timeAdjusted = hadBadgePopup
      ? Math.max(0, answer.time_to_answer_ms - BADGE_POPUP_DURATION_MS)
      : answer.time_to_answer_ms;

    return {
      question_number: answer.question_number,
      question_text: question?.text || '',
      selected_option_key: answer.selected_option,
      selected_option_text: selectedOption
        ? `${selectedOption.option_key}. ${selectedOption.option_text}`
        : answer.selected_option,
      time_to_answer_ms: answer.time_to_answer_ms,
      time_adjusted_ms: timeAdjusted,
      changed_answer: answer.changed_answer,
      change_count: answer.change_count,
      had_badge_popup: hadBadgePopup,
    };
  });
}

export async function submitResponse(
  response: CuestionarioResponse,
  tokenId: string,
  cuestionario: Cuestionario
): Promise<string> {
  const enrichedAnswers = enrichAnswers(response.answers, cuestionario);

  const totalPopupTime = enrichedAnswers.filter((a) => a.had_badge_popup).length * BADGE_POPUP_DURATION_MS;
  const totalTimeAdjusted = Math.max(0, response.total_time_ms - totalPopupTime);

  const result = await client.models.CuestionarioResponse.create({
    tokenId,
    cuestionarioId: cuestionario.id_cuestionario,
    cuestionarioVersion: cuestionario.version,
    cuestionarioTitle: cuestionario.title,
    startedAt: response.started_at,
    finishedAt: response.finished_at,
    totalTimeMs: response.total_time_ms,
    totalTimeAdjustedMs: totalTimeAdjusted,
    answersJson: enrichedAnswers,
    status: 'completed',
    downloadStatus: 'pending',
  });

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  console.log('Response submitted:', result.data?.id);
  return result.data?.id || '';
}

export async function listResponses(cuestionarioId?: string): Promise<StoredResponseData[]> {
  const result = cuestionarioId
    ? await client.models.CuestionarioResponse.list({
        filter: { cuestionarioId: { eq: cuestionarioId } },
      })
    : await client.models.CuestionarioResponse.list();

  if (result.errors) {
    console.error('Error listing responses:', result.errors);
    return [];
  }

  return (result.data || []).map((item) => ({
    id: item.id,
    tokenId: item.tokenId,
    cuestionarioId: item.cuestionarioId,
    cuestionarioVersion: item.cuestionarioVersion,
    cuestionarioTitle: item.cuestionarioTitle || null,
    startedAt: item.startedAt,
    finishedAt: item.finishedAt || null,
    totalTimeMs: item.totalTimeMs || null,
    totalTimeAdjustedMs: item.totalTimeAdjustedMs || null,
    answersJson: (item.answersJson as EnrichedAnswer[]) || [],
    status: (item.status as 'in_progress' | 'completed' | 'abandoned') || 'completed',
    downloadStatus: (item.downloadStatus as 'pending' | 'downloaded') || 'pending',
    downloadedAt: item.downloadedAt || null,
    downloadedBy: item.downloadedBy || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export async function getResponse(id: string): Promise<StoredResponseData | null> {
  const result = await client.models.CuestionarioResponse.get({ id });

  if (result.errors || !result.data) {
    console.error('Error getting response:', result.errors);
    return null;
  }

  const item = result.data;
  return {
    id: item.id,
    tokenId: item.tokenId,
    cuestionarioId: item.cuestionarioId,
    cuestionarioVersion: item.cuestionarioVersion,
    cuestionarioTitle: item.cuestionarioTitle || null,
    startedAt: item.startedAt,
    finishedAt: item.finishedAt || null,
    totalTimeMs: item.totalTimeMs || null,
    totalTimeAdjustedMs: item.totalTimeAdjustedMs || null,
    answersJson: (item.answersJson as EnrichedAnswer[]) || [],
    status: (item.status as 'in_progress' | 'completed' | 'abandoned') || 'completed',
    downloadStatus: (item.downloadStatus as 'pending' | 'downloaded') || 'pending',
    downloadedAt: item.downloadedAt || null,
    downloadedBy: item.downloadedBy || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function markResponseDownloaded(id: string, downloadedBy: string): Promise<void> {
  const result = await client.models.CuestionarioResponse.update({
    id,
    downloadStatus: 'downloaded',
    downloadedAt: new Date().toISOString(),
    downloadedBy,
  });

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  console.log('Response marked as downloaded:', id);
}

export async function unmarkResponse(id: string): Promise<void> {
  const result = await client.models.CuestionarioResponse.update({
    id,
    downloadStatus: 'pending',
    downloadedAt: null,
    downloadedBy: null,
  });

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  console.log('Response unmarked:', id);
}

export async function listPendingResponses(): Promise<StoredResponseData[]> {
  const result = await client.models.CuestionarioResponse.list({
    filter: { downloadStatus: { eq: 'pending' } },
  });

  if (result.errors) {
    console.error('Error listing pending responses:', result.errors);
    return [];
  }

  return (result.data || []).map((item) => ({
    id: item.id,
    tokenId: item.tokenId,
    cuestionarioId: item.cuestionarioId,
    cuestionarioVersion: item.cuestionarioVersion,
    cuestionarioTitle: item.cuestionarioTitle || null,
    startedAt: item.startedAt,
    finishedAt: item.finishedAt || null,
    totalTimeMs: item.totalTimeMs || null,
    totalTimeAdjustedMs: item.totalTimeAdjustedMs || null,
    answersJson: (item.answersJson as EnrichedAnswer[]) || [],
    status: (item.status as 'in_progress' | 'completed' | 'abandoned') || 'completed',
    downloadStatus: 'pending',
    downloadedAt: null,
    downloadedBy: null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}
