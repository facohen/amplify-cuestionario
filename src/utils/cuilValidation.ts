export interface CuilValidationResult {
  valid: boolean;
  normalized: string;
  formatted: string;
  error?: string;
}

const VALID_PREFIXES = ['20', '23', '24', '27', '30', '33', '34'];
const MULTIPLIERS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export function normalizeCuil(cuil: string): string {
  return cuil.replace(/\D/g, '');
}

export function formatCuil(cuil: string): string {
  const normalized = normalizeCuil(cuil);
  if (normalized.length !== 11) {
    return normalized;
  }
  return `${normalized.slice(0, 2)}-${normalized.slice(2, 10)}-${normalized.slice(10)}`;
}

function calculateCheckDigit(digits: string): number {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * MULTIPLIERS[i];
  }
  const remainder = sum % 11;
  if (remainder === 0) return 0;
  if (remainder === 1) return 9;
  return 11 - remainder;
}

export function validateCuil(cuil: string): CuilValidationResult {
  const normalized = normalizeCuil(cuil);
  const formatted = formatCuil(cuil);

  if (normalized.length === 0) {
    return {
      valid: false,
      normalized,
      formatted,
      error: 'CUIL es requerido',
    };
  }

  if (normalized.length !== 11) {
    return {
      valid: false,
      normalized,
      formatted,
      error: 'CUIL debe tener 11 dígitos',
    };
  }

  const prefix = normalized.slice(0, 2);
  if (!VALID_PREFIXES.includes(prefix)) {
    return {
      valid: false,
      normalized,
      formatted,
      error: `Prefijo inválido: ${prefix}. Debe ser ${VALID_PREFIXES.join(', ')}`,
    };
  }

  const expectedCheckDigit = calculateCheckDigit(normalized);
  const actualCheckDigit = parseInt(normalized[10], 10);

  if (expectedCheckDigit !== actualCheckDigit) {
    return {
      valid: false,
      normalized,
      formatted,
      error: 'Dígito verificador inválido',
    };
  }

  return {
    valid: true,
    normalized,
    formatted,
  };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Formato de email inválido' };
  }

  return { valid: true };
}

export function validateRespondentName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Nombre es requerido' };
  }

  if (name.trim().length < 3) {
    return { valid: false, error: 'Nombre debe tener al menos 3 caracteres' };
  }

  return { valid: true };
}
