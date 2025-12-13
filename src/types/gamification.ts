export type BadgeIcon = 'plant' | 'star' | 'fire' | 'diamond' | 'trophy';

export interface Badge {
  id: string;
  name: string;
  icon: BadgeIcon;
  questionThreshold: number;
  message: string;
}

export interface GameProgress {
  currentQuestion: number;
  totalQuestions: number;
  earnedBadges: Badge[];
  currentBadge: Badge | null;
}
