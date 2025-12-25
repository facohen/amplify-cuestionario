export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const MAX_QUESTIONS = 200;
const MAX_OPTIONS_PER_QUESTION = 10;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_QUESTION_TEXT_LENGTH = 500;
const MAX_OPTION_TEXT_LENGTH = 200;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidOptionKey(key: unknown): boolean {
  if (typeof key !== 'string') return false;
  // Option keys should be single letters A-Z or numbers
  return /^[A-Za-z0-9]$/.test(key);
}

function validateOption(option: unknown, questionNumber: number, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `questions[${questionNumber}].options[${index}]`;

  if (!option || typeof option !== 'object') {
    errors.push({ field: prefix, message: 'Opcion invalida' });
    return errors;
  }

  const opt = option as Record<string, unknown>;

  if (!isNonEmptyString(opt.option_key)) {
    errors.push({ field: `${prefix}.option_key`, message: 'option_key es requerido' });
  } else if (!isValidOptionKey(opt.option_key)) {
    errors.push({ field: `${prefix}.option_key`, message: 'option_key debe ser una letra o numero' });
  }

  if (!isNonEmptyString(opt.option_text)) {
    errors.push({ field: `${prefix}.option_text`, message: 'option_text es requerido' });
  } else if (opt.option_text.length > MAX_OPTION_TEXT_LENGTH) {
    errors.push({ field: `${prefix}.option_text`, message: `option_text excede ${MAX_OPTION_TEXT_LENGTH} caracteres` });
  }

  if (typeof opt.score !== 'number') {
    errors.push({ field: `${prefix}.score`, message: 'score debe ser un numero' });
  }

  return errors;
}

function validateQuestion(question: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `questions[${index}]`;

  if (!question || typeof question !== 'object') {
    errors.push({ field: prefix, message: 'Pregunta invalida' });
    return errors;
  }

  const q = question as Record<string, unknown>;

  if (typeof q.question_number !== 'number' || q.question_number < 1) {
    errors.push({ field: `${prefix}.question_number`, message: 'question_number debe ser un numero positivo' });
  }

  if (!isNonEmptyString(q.text)) {
    errors.push({ field: `${prefix}.text`, message: 'text es requerido' });
  } else if (q.text.length > MAX_QUESTION_TEXT_LENGTH) {
    errors.push({ field: `${prefix}.text`, message: `text excede ${MAX_QUESTION_TEXT_LENGTH} caracteres` });
  }

  if (q.question_type !== 'multiple_choice' && q.question_type !== 'forced_choice') {
    errors.push({ field: `${prefix}.question_type`, message: 'question_type debe ser "multiple_choice" o "forced_choice"' });
  }

  if (!Array.isArray(q.options)) {
    errors.push({ field: `${prefix}.options`, message: 'options debe ser un array' });
  } else {
    if (q.options.length < 2) {
      errors.push({ field: `${prefix}.options`, message: 'Debe haber al menos 2 opciones' });
    }
    if (q.options.length > MAX_OPTIONS_PER_QUESTION) {
      errors.push({ field: `${prefix}.options`, message: `Maximo ${MAX_OPTIONS_PER_QUESTION} opciones por pregunta` });
    }

    // Check for duplicate option keys
    const optionKeys = new Set<string>();
    q.options.forEach((opt: unknown, optIndex: number) => {
      errors.push(...validateOption(opt, index, optIndex));
      if (opt && typeof opt === 'object' && 'option_key' in opt) {
        const key = (opt as { option_key: string }).option_key;
        if (optionKeys.has(key)) {
          errors.push({ field: `${prefix}.options[${optIndex}].option_key`, message: `option_key "${key}" duplicado` });
        }
        optionKeys.add(key);
      }
    });
  }

  return errors;
}

export function validateCuestionario(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'El archivo debe contener un objeto JSON valido' }],
    };
  }

  const cuestionario = data as Record<string, unknown>;

  // Required fields
  if (!isNonEmptyString(cuestionario.id_cuestionario)) {
    errors.push({ field: 'id_cuestionario', message: 'id_cuestionario es requerido' });
  } else if (!/^[a-zA-Z0-9_-]+$/.test(cuestionario.id_cuestionario)) {
    errors.push({ field: 'id_cuestionario', message: 'id_cuestionario solo puede contener letras, numeros, guiones y guiones bajos' });
  }

  if (!isNonEmptyString(cuestionario.version)) {
    errors.push({ field: 'version', message: 'version es requerida' });
  }

  if (!isNonEmptyString(cuestionario.title)) {
    errors.push({ field: 'title', message: 'title es requerido' });
  } else if (cuestionario.title.length > MAX_TITLE_LENGTH) {
    errors.push({ field: 'title', message: `title excede ${MAX_TITLE_LENGTH} caracteres` });
  }

  if (cuestionario.description && typeof cuestionario.description === 'string') {
    if (cuestionario.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push({ field: 'description', message: `description excede ${MAX_DESCRIPTION_LENGTH} caracteres` });
    }
  }

  // Validate questions array
  if (!Array.isArray(cuestionario.questions)) {
    errors.push({ field: 'questions', message: 'questions debe ser un array' });
  } else {
    if (cuestionario.questions.length === 0) {
      errors.push({ field: 'questions', message: 'Debe haber al menos una pregunta' });
    }
    if (cuestionario.questions.length > MAX_QUESTIONS) {
      errors.push({ field: 'questions', message: `Maximo ${MAX_QUESTIONS} preguntas permitidas` });
    }

    // Check for duplicate question numbers
    const questionNumbers = new Set<number>();
    cuestionario.questions.forEach((q: unknown, index: number) => {
      errors.push(...validateQuestion(q, index));
      if (q && typeof q === 'object' && 'question_number' in q) {
        const num = (q as { question_number: number }).question_number;
        if (questionNumbers.has(num)) {
          errors.push({ field: `questions[${index}].question_number`, message: `question_number ${num} duplicado` });
        }
        questionNumbers.add(num);
      }
    });

    // Validate total_questions matches
    if (typeof cuestionario.total_questions === 'number') {
      if (cuestionario.total_questions !== cuestionario.questions.length) {
        errors.push({
          field: 'total_questions',
          message: `total_questions (${cuestionario.total_questions}) no coincide con el numero de preguntas (${cuestionario.questions.length})`,
        });
      }
    }
  }

  // Validate status if present
  if (cuestionario.status !== undefined) {
    if (!['draft', 'active', 'archived'].includes(cuestionario.status as string)) {
      errors.push({ field: 'status', message: 'status debe ser "draft", "active" o "archived"' });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  return `${errors.length} errores encontrados:\n${errors.slice(0, 5).map(e => `- ${e.field}: ${e.message}`).join('\n')}${errors.length > 5 ? `\n... y ${errors.length - 5} mas` : ''}`;
}
