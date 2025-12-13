import { useState, useCallback } from 'react';
import { Badge } from '../types/gamification';
import { getBadgeForQuestion, getEarnedBadges } from '../data/badges';

interface UseGameProgressReturn {
  currentBadge: Badge | null;
  earnedBadges: Badge[];
  showBadgeModal: boolean;
  checkForBadge: (questionNumber: number) => void;
  closeBadgeModal: () => void;
}

export function useGameProgress(): UseGameProgressReturn {
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const checkForBadge = useCallback((questionNumber: number) => {
    const badge = getBadgeForQuestion(questionNumber);
    if (badge) {
      setCurrentBadge(badge);
      setEarnedBadges(getEarnedBadges(questionNumber));
      setShowBadgeModal(true);
    }
  }, []);

  const closeBadgeModal = useCallback(() => {
    setShowBadgeModal(false);
  }, []);

  return {
    currentBadge,
    earnedBadges,
    showBadgeModal,
    checkForBadge,
    closeBadgeModal,
  };
}
