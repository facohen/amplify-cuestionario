import { CuestionarioResponse, Cuestionario, AnswerMetrics } from '../types/cuestionario';
import {
  uploadRespuesta,
  StoredResponse,
  EnrichedAnswer,
  BADGE_POPUP_DURATION_MS,
  BADGE_QUESTION_NUMBERS,
} from './cuestionarioStorageService';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

/**
 * Enriquece las respuestas con texto de pregunta y opción,
 * y ajusta el tiempo descontando el popup de insignia si corresponde.
 */
function enrichAnswers(
  answers: AnswerMetrics[],
  cuestionario: Cuestionario
): EnrichedAnswer[] {
  return answers.map((answer) => {
    const question = cuestionario.questions.find(
      (q) => q.question_number === answer.question_number
    );

    const selectedOption = question?.options.find(
      (o) => o.option_key === answer.selected_option
    );

    // Verificar si esta pregunta tuvo popup de insignia
    const hadBadgePopup = BADGE_QUESTION_NUMBERS.includes(answer.question_number);

    // Ajustar el tiempo descontando el popup si corresponde
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
): Promise<void> {
  try {
    // Enriquecer las respuestas
    const enrichedAnswers = enrichAnswers(response.answers, cuestionario);

    // Calcular tiempo total ajustado (descontando todos los popups)
    const totalPopupTime = enrichedAnswers.filter((a) => a.had_badge_popup).length * BADGE_POPUP_DURATION_MS;
    const totalTimeAdjusted = Math.max(0, response.total_time_ms - totalPopupTime);

    // Crear la respuesta enriquecida para S3
    const storedResponse: StoredResponse = {
      tokenId,
      submittedAt: new Date().toISOString(),
      startedAt: response.started_at,
      finishedAt: response.finished_at,
      totalTimeMs: response.total_time_ms,
      totalTimeAdjustedMs: totalTimeAdjusted,
      cuestionario: {
        id: cuestionario.id_cuestionario,
        version: cuestionario.version,
        title: cuestionario.title,
        description: cuestionario.description,
        total_questions: cuestionario.total_questions,
        creado_por: cuestionario.creado_por,
      },
      answers: enrichedAnswers,
    };

    const s3Path = await uploadRespuesta(tokenId, cuestionario.id_cuestionario, storedResponse);

    // Create tracking record in DynamoDB for external API
    try {
      await client.models.ResponseDownload.create({
        s3Path,
        cuestionarioId: cuestionario.id_cuestionario,
        tokenId,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      });
      console.log('Response download tracking record created');
    } catch (trackingError) {
      // Don't fail the submission if tracking record creation fails
      console.error('Error creating tracking record:', trackingError);
    }

    console.log('Response submitted successfully to S3');
  } catch (error) {
    console.error('Error submitting response:', error);
    throw error;
  }
}

