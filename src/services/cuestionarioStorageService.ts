import { uploadData, downloadData, list, remove } from 'aws-amplify/storage';
import { Cuestionario, CuestionarioStatus } from '../types/cuestionario';

const CUESTIONARIOS_PATH = 'cuestionarios/';
const RESPUESTAS_PATH = 'respuestas/';

// ============ CUESTIONARIOS ============

export async function uploadCuestionario(cuestionario: Cuestionario): Promise<string> {
  const fileName = `${cuestionario.id_cuestionario}.json`;
  const path = `${CUESTIONARIOS_PATH}${fileName}`;

  try {
    await uploadData({
      path,
      data: JSON.stringify(cuestionario, null, 2),
      options: {
        contentType: 'application/json',
        // Explicitly use authenticated access for admin operations
      },
    }).result;

    console.log('Cuestionario uploaded:', path);
    return path;
  } catch (error) {
    console.error('Error uploading cuestionario:', error);
    throw error;
  }
}

export async function downloadCuestionario(cuestionarioId: string): Promise<Cuestionario | null> {
  const path = `${CUESTIONARIOS_PATH}${cuestionarioId}.json`;

  try {
    const result = await downloadData({ path }).result;
    const text = await result.body.text();
    return JSON.parse(text) as Cuestionario;
  } catch (error) {
    console.error('Error downloading cuestionario:', error);
    return null;
  }
}

export async function listCuestionarios(): Promise<string[]> {
  try {
    const result = await list({ path: CUESTIONARIOS_PATH });
    return result.items.map((item) => item.path.replace(CUESTIONARIOS_PATH, '').replace('.json', ''));
  } catch (error) {
    console.error('Error listing cuestionarios:', error);
    return [];
  }
}

export async function deleteCuestionario(cuestionarioId: string): Promise<void> {
  const path = `${CUESTIONARIOS_PATH}${cuestionarioId}.json`;

  try {
    await remove({ path });
    console.log('Cuestionario deleted:', path);
  } catch (error) {
    console.error('Error deleting cuestionario:', error);
    throw error;
  }
}

export async function updateCuestionarioStatus(
  cuestionarioId: string,
  newStatus: CuestionarioStatus
): Promise<Cuestionario | null> {
  console.log('updateCuestionarioStatus called:', { cuestionarioId, newStatus });

  try {
    // Download current cuestionario
    console.log('Downloading cuestionario...');
    const cuestionario = await downloadCuestionario(cuestionarioId);
    if (!cuestionario) {
      throw new Error(`Cuestionario not found: ${cuestionarioId}`);
    }
    console.log('Current status:', cuestionario.status);

    // Update status
    cuestionario.status = newStatus;

    // Re-upload with new status
    console.log('Uploading cuestionario with new status...');
    await uploadCuestionario(cuestionario);

    console.log('Cuestionario status updated successfully:', cuestionarioId, newStatus);
    return cuestionario;
  } catch (error) {
    console.error('Error updating cuestionario status:', error);
    throw error;
  }
}

export async function getActiveCuestionario(): Promise<Cuestionario | null> {
  try {
    const ids = await listCuestionarios();
    for (const id of ids) {
      const cuestionario = await downloadCuestionario(id);
      if (cuestionario && cuestionario.status === 'active') {
        return cuestionario;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting active cuestionario:', error);
    return null;
  }
}

// ============ RESPUESTAS ============

// Tiempo que se muestra el popup de insignia (en ms)
export const BADGE_POPUP_DURATION_MS = 4000;

// Preguntas donde se muestra el popup de insignia (después de completar 10, 20, 30, 40, 50)
export const BADGE_QUESTION_NUMBERS = [11, 21, 31, 41, 51];

export interface EnrichedAnswer {
  question_number: number;
  question_text: string;
  selected_option_key: string;
  selected_option_text: string;
  time_to_answer_ms: number;
  time_adjusted_ms: number; // Tiempo ajustado (descontando popup si aplica)
  changed_answer: boolean;
  change_count: number;
  had_badge_popup: boolean;
}

export interface StoredResponse {
  // Metadatos de la respuesta
  tokenId: string;
  submittedAt: string;
  startedAt: string;
  finishedAt: string;
  totalTimeMs: number;
  totalTimeAdjustedMs: number; // Tiempo total ajustado (descontando popups)

  // Metadatos del cuestionario
  cuestionario: {
    id: string;
    version: string;
    title: string;
    description: string;
    total_questions: number;
    creado_por: string;
  };

  // Respuestas enriquecidas
  answers: EnrichedAnswer[];
}

export async function uploadRespuesta(
  tokenId: string,
  cuestionarioId: string,
  response: StoredResponse
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${tokenId}_${timestamp}.json`;
  const path = `${RESPUESTAS_PATH}${cuestionarioId}/${fileName}`;

  console.log('uploadRespuesta: attempting to upload to path:', path);

  try {
    await uploadData({
      path,
      data: JSON.stringify(response, null, 2),
      options: {
        contentType: 'application/json',
      },
    }).result;

    console.log('Respuesta uploaded successfully:', path);
    return path;
  } catch (error) {
    console.error('Error uploading respuesta:', error);
    throw error;
  }
}

export async function listRespuestas(cuestionarioId?: string): Promise<string[]> {
  const path = cuestionarioId
    ? `${RESPUESTAS_PATH}${cuestionarioId}/`
    : RESPUESTAS_PATH;

  try {
    const result = await list({
      path,
      options: {
        listAll: true, // List all items including in subdirectories
      },
    });
    console.log('listRespuestas result:', result.items.length, 'items found');
    return result.items.map((item) => item.path);
  } catch (error) {
    console.error('Error listing respuestas:', error);
    return [];
  }
}

export async function downloadRespuesta(path: string): Promise<StoredResponse | null> {
  try {
    const result = await downloadData({ path }).result;
    const text = await result.body.text();
    return JSON.parse(text) as StoredResponse;
  } catch (error) {
    console.error('Error downloading respuesta:', error);
    return null;
  }
}
