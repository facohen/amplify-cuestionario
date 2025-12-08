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
