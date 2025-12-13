import { Badge } from '../types/gamification';

export const badges: Badge[] = [
  {
    id: 'novato',
    name: 'Novato Curioso',
    icon: 'plant',
    questionThreshold: 10,
    message: 'Excelente comienzo! Vas muy bien.',
  },
  {
    id: 'participante',
    name: 'Participante Activo',
    icon: 'star',
    questionThreshold: 20,
    message: 'Estas progresando muy bien!',
  },
  {
    id: 'experto',
    name: 'Experto en Progreso',
    icon: 'fire',
    questionThreshold: 30,
    message: 'Mas de la mitad! Sigue asi!',
  },
  {
    id: 'maestro',
    name: 'Maestro de Encuestas',
    icon: 'diamond',
    questionThreshold: 40,
    message: 'Ya casi! Lo estas haciendo increible!',
  },
  {
    id: 'leyenda',
    name: 'Leyenda',
    icon: 'trophy',
    questionThreshold: 50,
    message: 'Eres una leyenda! Solo faltan unas pocas!',
  },
];

export function getBadgeForQuestion(questionNumber: number): Badge | null {
  return badges.find((badge) => badge.questionThreshold === questionNumber) || null;
}

export function getEarnedBadges(questionNumber: number): Badge[] {
  return badges.filter((badge) => badge.questionThreshold <= questionNumber);
}
