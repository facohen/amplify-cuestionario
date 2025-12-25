import { CuestionarioResponse, Cuestionario } from '../types/cuestionario';
import { submitResponse as submitToDynamoDB, RespondentInfo, AdministratorInfo } from './cuestionarioService';

export async function submitResponse(
  response: CuestionarioResponse,
  tokenId: string,
  cuestionario: Cuestionario,
  respondent?: RespondentInfo | null,
  administrator?: AdministratorInfo | null,
  abandonedAtQuestion?: number
): Promise<string> {
  try {
    const responseId = await submitToDynamoDB(response, tokenId, cuestionario, respondent, administrator, abandonedAtQuestion);
    console.log('Response submitted successfully to DynamoDB, id:', responseId);
    return responseId;
  } catch (error) {
    console.error('Error submitting response:', error);
    throw error;
  }
}
