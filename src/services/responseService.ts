import { CuestionarioResponse, Cuestionario } from '../types/cuestionario';
import { submitResponse as submitToDynamoDB, RespondentInfo } from './cuestionarioService';

export async function submitResponse(
  response: CuestionarioResponse,
  tokenId: string,
  cuestionario: Cuestionario,
  respondent?: RespondentInfo | null
): Promise<void> {
  try {
    await submitToDynamoDB(response, tokenId, cuestionario, respondent);
    console.log('Response submitted successfully to DynamoDB');
  } catch (error) {
    console.error('Error submitting response:', error);
    throw error;
  }
}
