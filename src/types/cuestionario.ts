export interface Option {
  option_key: string;
  option_text: string;
  score: number;
}

export interface Question {
  question_number: number;
  text: string;
  question_type: "multiple_choice" | "forced_choice";
  options: Option[];
}

export interface Cuestionario {
  id_cuestionario: string;
  version: string;
  title: string;
  description: string;
  total_questions: number;
  creado_por: string;
  status: string;
  questions: Question[];
}

export interface AnswerMetrics {
  question_number: number;
  selected_option: string;
  time_to_answer_ms: number;
  changed_answer: boolean;
  change_count: number;
}

export interface CuestionarioResponse {
  response_id: string;
  cuestionario_id: string;
  cuestionario_version: string;
  started_at: string;
  finished_at: string;
  total_time_ms: number;
  answers: AnswerMetrics[];
}
