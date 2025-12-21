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
  try {
    // Download current cuestionario
    const cuestionario = await downloadCuestionario(cuestionarioId);
    if (!cuestionario) {
      throw new Error('Cuestionario not found');
    }

    // Update status
    cuestionario.status = newStatus;

    // Re-upload with new status
    await uploadCuestionario(cuestionario);

    console.log('Cuestionario status updated:', cuestionarioId, newStatus);
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

export interface StoredResponse {
  tokenId: string;
  cuestionarioId: string;
  cuestionarioVersion: string;
  startedAt: string;
  finishedAt: string;
  totalTimeMs: number;
  answers: unknown[];
  submittedAt: string;
}

export async function uploadRespuesta(
  tokenId: string,
  cuestionarioId: string,
  response: StoredResponse
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${cuestionarioId}/${tokenId}_${timestamp}.json`;
  const path = `${RESPUESTAS_PATH}${fileName}`;

  try {
    await uploadData({
      path,
      data: JSON.stringify(response, null, 2),
      options: {
        contentType: 'application/json',
      },
    }).result;

    console.log('Respuesta uploaded:', path);
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
    const result = await list({ path });
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
