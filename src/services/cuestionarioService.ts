import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Cuestionario, CuestionarioResponse, CuestionarioStatus, AnswerMetrics, Question } from '../types/cuestionario';

// Cliente público (API Key) para operaciones de lectura pública
const client = generateClient<Schema>();

// Cliente autenticado (Cognito) para operaciones de admin
const authClient = generateClient<Schema>({ authMode: 'userPool' });

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
  // Datos del respondente (para carga asistida)
  respondentName: string | null;
  respondentEmail: string | null;
  respondentCuil: string | null;
  // Datos del administrador
  administeredBy: string | null;
  administeredByEmail: string | null;
  // Feedback del respondente
  feedbackEaseOfUse: number | null;
  feedbackSurveyLength: number | null;
  feedbackWillingToReceive: boolean | null;
  feedbackSubmittedAt: string | null;
  // Datos de abandono
  abandonedAtQuestion: number | null;
  abandonReason: string | null;
}

export interface FeedbackData {
  easeOfUse: number;
  surveyLength: number;
  willingToReceive: boolean;
}

export interface AbandonFeedbackData {
  abandonReason: string;
  easeOfUse?: number;
  surveyLength?: number;
  willingToReceive?: boolean;
}

export interface RespondentInfo {
  name: string;
  email: string;
  cuil: string;
}

// ============ HELPERS ============

function parseQuestionsJson(questionsJson: unknown): Question[] {
  if (!questionsJson) return [];
  if (typeof questionsJson === 'string') {
    try {
      return JSON.parse(questionsJson) as Question[];
    } catch {
      console.error('Failed to parse questionsJson string');
      return [];
    }
  }
  if (Array.isArray(questionsJson)) {
    return questionsJson as Question[];
  }
  return [];
}

function parseAnswersJson(answersJson: unknown): EnrichedAnswer[] {
  if (!answersJson) return [];
  if (typeof answersJson === 'string') {
    try {
      return JSON.parse(answersJson) as EnrichedAnswer[];
    } catch {
      console.error('Failed to parse answersJson string');
      return [];
    }
  }
  if (Array.isArray(answersJson)) {
    return answersJson as EnrichedAnswer[];
  }
  return [];
}

// ============ CUESTIONARIOS ============

export async function createCuestionario(cuestionario: Cuestionario): Promise<string> {
  // Usar authClient porque create requiere autenticación
  const result = await authClient.models.CuestionarioDefinition.create({
    id: cuestionario.id_cuestionario,
    version: cuestionario.version,
    title: cuestionario.title,
    description: cuestionario.description,
    totalQuestions: cuestionario.total_questions,
    creadoPor: cuestionario.creado_por,
    status: cuestionario.status || 'draft',
    questionsJson: JSON.stringify(cuestionario.questions),
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
    questions: parseQuestionsJson(item.questionsJson),
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
    questions: parseQuestionsJson(item.questionsJson),
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
    questions: parseQuestionsJson(item.questionsJson),
  };
}

export async function updateCuestionarioStatus(id: string, status: CuestionarioStatus): Promise<void> {
  console.log('updateCuestionarioStatus:', id, status);

  // Usar authClient porque update requiere autenticación
  const result = await authClient.models.CuestionarioDefinition.update({
    id,
    status,
  });

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  console.log('Cuestionario status updated:', id, status);
}

export async function deleteCuestionario(id: string): Promise<void> {
  // Usar authClient porque delete requiere autenticación
  const result = await authClient.models.CuestionarioDefinition.delete({ id });

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

export interface AdministratorInfo {
  email: string;
  name?: string;
}

export async function submitResponse(
  response: CuestionarioResponse,
  tokenId: string,
  cuestionario: Cuestionario,
  respondent?: RespondentInfo | null,
  administrator?: AdministratorInfo | null
): Promise<string> {
  console.log('submitResponse called:', { tokenId, cuestionarioId: cuestionario.id_cuestionario });

  const enrichedAnswers = enrichAnswers(response.answers, cuestionario);
  console.log('Enriched answers count:', enrichedAnswers.length);
  console.log('Sample enriched answer:', enrichedAnswers[0]);

  const totalPopupTime = enrichedAnswers.filter((a) => a.had_badge_popup).length * BADGE_POPUP_DURATION_MS;
  const totalTimeAdjusted = Math.max(0, response.total_time_ms - totalPopupTime);

  // Incluir todos los campos - el schema en producción debe estar actualizado
  // Si hay campos faltantes, hacer deploy del schema
  const payload = {
    tokenId,
    cuestionarioId: cuestionario.id_cuestionario,
    cuestionarioVersion: cuestionario.version,
    cuestionarioTitle: cuestionario.title,
    startedAt: response.started_at,
    finishedAt: response.finished_at,
    totalTimeMs: response.total_time_ms,
    totalTimeAdjustedMs: totalTimeAdjusted,
    answersJson: JSON.stringify(enrichedAnswers),
    status: 'completed' as const,
    downloadStatus: 'pending' as const,
    // Datos del respondente (para carga asistida)
    respondentName: respondent?.name || null,
    respondentEmail: respondent?.email || null,
    respondentCuil: respondent?.cuil || null,
    // Datos del administrador
    administeredBy: administrator?.name || null,
    administeredByEmail: administrator?.email || null,
  };

  console.log('Creating CuestionarioResponse with payload:', {
    ...payload,
    answersJson: `[${enrichedAnswers.length} answers]`
  });

  try {
    const result = await client.models.CuestionarioResponse.create(payload);

    if (result.errors) {
      console.error('GraphQL errors creating response:', result.errors);
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    console.log('Response submitted successfully:', result.data?.id);
    return result.data?.id || '';
  } catch (error) {
    console.error('Exception creating CuestionarioResponse:', error);
    throw error;
  }
}

export async function listResponses(cuestionarioId?: string): Promise<StoredResponseData[]> {
  console.log('listResponses called, cuestionarioId:', cuestionarioId);

  try {
    // Usar authClient porque read de responses requiere autenticación
    // Nota: El GSI está definido en el schema pero Amplify Gen 2 usa filtros
    // La Lambda API sí usa el GSI directamente en DynamoDB
    const result = cuestionarioId
      ? await authClient.models.CuestionarioResponse.list({
          filter: { cuestionarioId: { eq: cuestionarioId } },
        })
      : await authClient.models.CuestionarioResponse.list();

    console.log('listResponses result:', {
      dataCount: result.data?.length || 0,
      errors: result.errors
    });

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
      answersJson: parseAnswersJson(item.answersJson),
      status: (item.status as 'in_progress' | 'completed' | 'abandoned') || 'completed',
      downloadStatus: (item.downloadStatus as 'pending' | 'downloaded') || 'pending',
      downloadedAt: item.downloadedAt || null,
      downloadedBy: item.downloadedBy || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      respondentName: item.respondentName || null,
      respondentEmail: item.respondentEmail || null,
      respondentCuil: item.respondentCuil || null,
      administeredBy: item.administeredBy || null,
      administeredByEmail: item.administeredByEmail || null,
      feedbackEaseOfUse: item.feedbackEaseOfUse || null,
      feedbackSurveyLength: item.feedbackSurveyLength || null,
      feedbackWillingToReceive: item.feedbackWillingToReceive ?? null,
      feedbackSubmittedAt: item.feedbackSubmittedAt || null,
      abandonedAtQuestion: item.abandonedAtQuestion || null,
      abandonReason: item.abandonReason || null,
    }));
  } catch (error) {
    console.error('Exception in listResponses:', error);
    return [];
  }
}

export async function getResponse(id: string): Promise<StoredResponseData | null> {
  // Usar authClient porque read de responses requiere autenticación
  const result = await authClient.models.CuestionarioResponse.get({ id });

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
    answersJson: parseAnswersJson(item.answersJson),
    status: (item.status as 'in_progress' | 'completed' | 'abandoned') || 'completed',
    downloadStatus: (item.downloadStatus as 'pending' | 'downloaded') || 'pending',
    downloadedAt: item.downloadedAt || null,
    downloadedBy: item.downloadedBy || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    respondentName: item.respondentName || null,
    respondentEmail: item.respondentEmail || null,
    respondentCuil: item.respondentCuil || null,
    administeredBy: item.administeredBy || null,
    administeredByEmail: item.administeredByEmail || null,
    feedbackEaseOfUse: item.feedbackEaseOfUse || null,
    feedbackSurveyLength: item.feedbackSurveyLength || null,
    feedbackWillingToReceive: item.feedbackWillingToReceive ?? null,
    feedbackSubmittedAt: item.feedbackSubmittedAt || null,
    abandonedAtQuestion: item.abandonedAtQuestion || null,
    abandonReason: item.abandonReason || null,
  };
}

export async function markResponseDownloaded(id: string, downloadedBy: string): Promise<void> {
  // Usar authClient porque update requiere autenticación
  const result = await authClient.models.CuestionarioResponse.update({
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
  // Usar authClient porque update requiere autenticación
  const result = await authClient.models.CuestionarioResponse.update({
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

// ============ ABANDONOS ============

export interface AbandonedResponseData {
  tokenId: string;
  cuestionarioId: string;
  cuestionarioVersion: string;
  cuestionarioTitle: string;
  startedAt: string;
  answers: AnswerMetrics[];
  abandonedAt: string;
}

export async function submitAbandonedResponse(data: AbandonedResponseData): Promise<void> {
  console.log('submitAbandonedResponse called:', { tokenId: data.tokenId, answersCount: data.answers.length });

  const totalTimeMs = new Date(data.abandonedAt).getTime() - new Date(data.startedAt).getTime();

  const payload = {
    tokenId: data.tokenId,
    cuestionarioId: data.cuestionarioId,
    cuestionarioVersion: data.cuestionarioVersion,
    cuestionarioTitle: data.cuestionarioTitle,
    startedAt: data.startedAt,
    finishedAt: null,
    totalTimeMs,
    totalTimeAdjustedMs: null,
    answersJson: JSON.stringify(data.answers),
    status: 'abandoned' as const,
    downloadStatus: 'pending' as const,
  };

  try {
    const result = await client.models.CuestionarioResponse.create(payload);

    if (result.errors) {
      console.error('GraphQL errors creating abandoned response:', result.errors);
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    console.log('Abandoned response submitted:', result.data?.id);

    // Marcar token como usado
    await client.models.Token.update({
      id: data.tokenId,
      status: 'used',
      usedAt: data.abandonedAt,
    });

    console.log('Token marked as used after abandonment:', data.tokenId);
  } catch (error) {
    console.error('Exception creating abandoned response:', error);
    throw error;
  }
}

export async function listPendingResponses(): Promise<StoredResponseData[]> {
  // Usar authClient porque read de responses requiere autenticación
  // Nota: El GSI está definido en el schema, la Lambda API lo usa directamente
  const result = await authClient.models.CuestionarioResponse.list({
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
    answersJson: parseAnswersJson(item.answersJson),
    status: (item.status as 'in_progress' | 'completed' | 'abandoned') || 'completed',
    downloadStatus: 'pending',
    downloadedAt: null,
    downloadedBy: null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    respondentName: item.respondentName || null,
    respondentEmail: item.respondentEmail || null,
    respondentCuil: item.respondentCuil || null,
    administeredBy: item.administeredBy || null,
    administeredByEmail: item.administeredByEmail || null,
    feedbackEaseOfUse: item.feedbackEaseOfUse || null,
    feedbackSurveyLength: item.feedbackSurveyLength || null,
    feedbackWillingToReceive: item.feedbackWillingToReceive ?? null,
    feedbackSubmittedAt: item.feedbackSubmittedAt || null,
    abandonedAtQuestion: item.abandonedAtQuestion || null,
    abandonReason: item.abandonReason || null,
  }));
}

// Listar respuestas administradas por un usuario específico
export async function listResponsesByAdministrator(adminEmail: string): Promise<StoredResponseData[]> {
  try {
    // Listar todas las respuestas y filtrar por email del administrador
    // TODO: Usar índice secundario cuando el schema esté desplegado
    const result = await authClient.models.CuestionarioResponse.list();

    if (result.errors) {
      console.error('Error listing responses by administrator:', result.errors);
      return [];
    }

    // Filtrar por administeredByEmail
    const filtered = (result.data || []).filter(
      (item) => item.administeredByEmail === adminEmail
    );

    return filtered.map((item) => ({
      id: item.id,
      tokenId: item.tokenId,
      cuestionarioId: item.cuestionarioId,
      cuestionarioVersion: item.cuestionarioVersion,
      cuestionarioTitle: item.cuestionarioTitle || null,
      startedAt: item.startedAt,
      finishedAt: item.finishedAt || null,
      totalTimeMs: item.totalTimeMs || null,
      totalTimeAdjustedMs: item.totalTimeAdjustedMs || null,
      answersJson: parseAnswersJson(item.answersJson),
      status: (item.status as 'in_progress' | 'completed' | 'abandoned') || 'completed',
      downloadStatus: (item.downloadStatus as 'pending' | 'downloaded') || 'pending',
      downloadedAt: item.downloadedAt || null,
      downloadedBy: item.downloadedBy || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      respondentName: item.respondentName || null,
      respondentEmail: item.respondentEmail || null,
      respondentCuil: item.respondentCuil || null,
      administeredBy: item.administeredBy || null,
      administeredByEmail: item.administeredByEmail || null,
      feedbackEaseOfUse: item.feedbackEaseOfUse || null,
      feedbackSurveyLength: item.feedbackSurveyLength || null,
      feedbackWillingToReceive: item.feedbackWillingToReceive ?? null,
      feedbackSubmittedAt: item.feedbackSubmittedAt || null,
      abandonedAtQuestion: item.abandonedAtQuestion || null,
      abandonReason: item.abandonReason || null,
    }));
  } catch (error) {
    console.error('Exception in listResponsesByAdministrator:', error);
    return [];
  }
}

// Guardar feedback del respondente
export async function submitFeedback(responseId: string, feedback: FeedbackData): Promise<void> {
  try {
    const result = await client.models.CuestionarioResponse.update({
      id: responseId,
      feedbackEaseOfUse: feedback.easeOfUse,
      feedbackSurveyLength: feedback.surveyLength,
      feedbackWillingToReceive: feedback.willingToReceive,
      feedbackSubmittedAt: new Date().toISOString(),
    });

    if (result.errors) {
      console.error('GraphQL errors submitting feedback:', result.errors);
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    console.log('Feedback submitted successfully:', responseId);
  } catch (error) {
    console.error('Exception submitting feedback:', error);
    throw error;
  }
}

// Guardar abandono con feedback opcional
export async function submitAbandonWithFeedback(
  responseId: string,
  abandonedAtQuestion: number,
  feedback: AbandonFeedbackData
): Promise<void> {
  try {
    const result = await client.models.CuestionarioResponse.update({
      id: responseId,
      status: 'abandoned',
      abandonedAtQuestion,
      abandonReason: feedback.abandonReason,
      feedbackEaseOfUse: feedback.easeOfUse || null,
      feedbackSurveyLength: feedback.surveyLength || null,
      feedbackWillingToReceive: feedback.willingToReceive ?? null,
      feedbackSubmittedAt: new Date().toISOString(),
    });

    if (result.errors) {
      console.error('GraphQL errors submitting abandon feedback:', result.errors);
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    console.log('Abandon feedback submitted successfully:', responseId);
  } catch (error) {
    console.error('Exception submitting abandon feedback:', error);
    throw error;
  }
}
