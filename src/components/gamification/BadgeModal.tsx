import { useEffect } from 'react';
import Modal from '../ui/Modal';
import BadgeIcon from './BadgeIcon';
import Button from '../ui/Button';
import { Badge } from '../../types/gamification';
import { motion } from 'framer-motion';

interface BadgeModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

export default function BadgeModal({
  badge,
  isOpen,
  onClose,
  autoCloseDelay = 4000,
}: BadgeModalProps) {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!badge) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        {/* Celebration emojis */}
        <motion.div
          className="flex justify-center gap-2 mb-4 text-3xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="animate-bounce">🎉</span>
          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>
            ✨
          </span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
            🎉
          </span>
        </motion.div>

        {/* Badge title */}
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Nueva Insignia Desbloqueada!
        </motion.h2>

        {/* Badge icon with floating animation */}
        <div className="flex justify-center mb-4">
          <div className="animate-float">
            <BadgeIcon icon={badge.icon} size="lg" animate />
          </div>
        </div>

        {/* Badge name */}
        <motion.h3
          className="text-xl font-semibold bg-gradient-to-r from-primary-purple to-accent-orange bg-clip-text text-transparent mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {badge.name}
        </motion.h3>

        {/* Motivational message */}
        <motion.p
          className="text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {badge.message}
        </motion.p>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button onClick={onClose} variant="primary" size="lg">
            Continuar
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
}
