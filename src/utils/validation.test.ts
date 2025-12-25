import { describe, it, expect } from 'vitest';
import { validateCuestionario, formatValidationErrors } from './validation';

describe('validateCuestionario', () => {
  const validCuestionario = {
    id_cuestionario: 'test-cuestionario-1',
    version: '1.0.0',
    title: 'Test Cuestionario',
    description: 'A test questionnaire',
    total_questions: 2,
    questions: [
      {
        question_number: 1,
        text: 'What is your favorite color?',
        question_type: 'multiple_choice',
        options: [
          { option_key: 'A', option_text: 'Red', score: 1 },
          { option_key: 'B', option_text: 'Blue', score: 2 },
        ],
      },
      {
        question_number: 2,
        text: 'What is your favorite animal?',
        question_type: 'forced_choice',
        options: [
          { option_key: 'A', option_text: 'Dog', score: 1 },
          { option_key: 'B', option_text: 'Cat', score: 2 },
        ],
      },
    ],
  };

  it('validates a correct cuestionario', () => {
    const result = validateCuestionario(validCuestionario);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects null input', () => {
    const result = validateCuestionario(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('objeto JSON');
  });

  it('rejects missing id_cuestionario', () => {
    const invalid = { ...validCuestionario, id_cuestionario: '' };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'id_cuestionario')).toBe(true);
  });

  it('rejects invalid id_cuestionario characters', () => {
    const invalid = { ...validCuestionario, id_cuestionario: 'test cuestionario!' };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'id_cuestionario')).toBe(true);
  });

  it('rejects missing version', () => {
    const invalid = { ...validCuestionario, version: undefined };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'version')).toBe(true);
  });

  it('rejects missing title', () => {
    const invalid = { ...validCuestionario, title: '' };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'title')).toBe(true);
  });

  it('rejects title exceeding max length', () => {
    const invalid = { ...validCuestionario, title: 'a'.repeat(201) };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'title' && e.message.includes('200'))).toBe(true);
  });

  it('rejects empty questions array', () => {
    const invalid = { ...validCuestionario, questions: [] };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('al menos una pregunta'))).toBe(true);
  });

  it('rejects questions with less than 2 options', () => {
    const invalid = {
      ...validCuestionario,
      questions: [
        {
          question_number: 1,
          text: 'Test question',
          question_type: 'multiple_choice',
          options: [{ option_key: 'A', option_text: 'Only one', score: 1 }],
        },
      ],
    };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('al menos 2 opciones'))).toBe(true);
  });

  it('rejects duplicate question numbers', () => {
    const invalid = {
      ...validCuestionario,
      questions: [
        {
          question_number: 1,
          text: 'First question',
          question_type: 'multiple_choice',
          options: [
            { option_key: 'A', option_text: 'A', score: 1 },
            { option_key: 'B', option_text: 'B', score: 2 },
          ],
        },
        {
          question_number: 1, // duplicate!
          text: 'Second question with same number',
          question_type: 'multiple_choice',
          options: [
            { option_key: 'A', option_text: 'A', score: 1 },
            { option_key: 'B', option_text: 'B', score: 2 },
          ],
        },
      ],
    };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('duplicado'))).toBe(true);
  });

  it('rejects duplicate option keys within a question', () => {
    const invalid = {
      ...validCuestionario,
      questions: [
        {
          question_number: 1,
          text: 'Test question',
          question_type: 'multiple_choice',
          options: [
            { option_key: 'A', option_text: 'First A', score: 1 },
            { option_key: 'A', option_text: 'Second A', score: 2 }, // duplicate!
          ],
        },
      ],
    };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('option_key') && e.message.includes('duplicado'))).toBe(true);
  });

  it('rejects invalid question_type', () => {
    const invalid = {
      ...validCuestionario,
      questions: [
        {
          question_number: 1,
          text: 'Test question',
          question_type: 'invalid_type',
          options: [
            { option_key: 'A', option_text: 'A', score: 1 },
            { option_key: 'B', option_text: 'B', score: 2 },
          ],
        },
      ],
    };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('question_type'))).toBe(true);
  });

  it('rejects mismatched total_questions', () => {
    const invalid = { ...validCuestionario, total_questions: 5 };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'total_questions')).toBe(true);
  });

  it('rejects invalid status', () => {
    const invalid = { ...validCuestionario, status: 'invalid' };
    const result = validateCuestionario(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'status')).toBe(true);
  });

  it('accepts valid status values', () => {
    for (const status of ['draft', 'active', 'archived']) {
      const valid = { ...validCuestionario, status };
      const result = validateCuestionario(valid);
      expect(result.valid).toBe(true);
    }
  });
});

describe('formatValidationErrors', () => {
  it('returns empty string for no errors', () => {
    expect(formatValidationErrors([])).toBe('');
  });

  it('returns single error message directly', () => {
    const errors = [{ field: 'title', message: 'Title is required' }];
    expect(formatValidationErrors(errors)).toBe('Title is required');
  });

  it('formats multiple errors with count', () => {
    const errors = [
      { field: 'title', message: 'Title is required' },
      { field: 'version', message: 'Version is required' },
    ];
    const result = formatValidationErrors(errors);
    expect(result).toContain('2 errores');
    expect(result).toContain('title');
    expect(result).toContain('version');
  });

  it('truncates errors beyond 5', () => {
    const errors = Array.from({ length: 10 }, (_, i) => ({
      field: `field${i}`,
      message: `Error ${i}`,
    }));
    const result = formatValidationErrors(errors);
    expect(result).toContain('10 errores');
    expect(result).toContain('y 5 mas');
  });
});
