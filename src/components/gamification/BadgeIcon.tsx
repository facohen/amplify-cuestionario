import { motion } from 'framer-motion';
import { BadgeIcon as BadgeIconType } from '../../types/gamification';

interface BadgeIconProps {
  icon: BadgeIconType;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

export default function BadgeIcon({
  icon,
  size = 'md',
  animate = false,
  className = '',
}: BadgeIconProps) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const iconMap: Record<BadgeIconType, JSX.Element> = {
    plant: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#22c55e" opacity="0.2" />
        <path
          d="M50 75V45"
          stroke="#22c55e"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M50 45C50 45 35 45 35 30C35 30 50 35 50 45Z"
          fill="#22c55e"
        />
        <path
          d="M50 55C50 55 65 50 70 35C70 35 55 45 50 55Z"
          fill="#16a34a"
        />
        <path
          d="M50 65C50 65 35 60 30 50C30 50 45 55 50 65Z"
          fill="#22c55e"
        />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#eab308" opacity="0.2" />
        <path
          d="M50 20L58.5 38.5L79 41.5L64 56L68 77L50 67L32 77L36 56L21 41.5L41.5 38.5L50 20Z"
          fill="#eab308"
          stroke="#ca8a04"
          strokeWidth="2"
        />
      </svg>
    ),
    fire: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#f97316" opacity="0.2" />
        <path
          d="M50 20C50 20 35 35 35 55C35 68 42 80 50 80C58 80 65 68 65 55C65 35 50 20 50 20Z"
          fill="#f97316"
        />
        <path
          d="M50 40C50 40 42 50 42 60C42 68 46 75 50 75C54 75 58 68 58 60C58 50 50 40 50 40Z"
          fill="#fbbf24"
        />
        <path
          d="M50 55C50 55 47 60 47 65C47 70 48.5 72 50 72C51.5 72 53 70 53 65C53 60 50 55 50 55Z"
          fill="#fef3c7"
        />
      </svg>
    ),
    diamond: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#a855f7" opacity="0.2" />
        <path
          d="M50 20L75 45L50 80L25 45L50 20Z"
          fill="#a855f7"
        />
        <path
          d="M50 20L60 45L50 80L40 45L50 20Z"
          fill="#c084fc"
        />
        <path
          d="M25 45L50 35L75 45L50 55L25 45Z"
          fill="#d8b4fe"
          opacity="0.6"
        />
      </svg>
    ),
    trophy: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#eab308" opacity="0.2" />
        <path
          d="M30 25H70V45C70 60 60 70 50 70C40 70 30 60 30 45V25Z"
          fill="#eab308"
        />
        <path
          d="M30 30C30 30 20 30 20 40C20 50 30 50 30 50"
          stroke="#ca8a04"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M70 30C70 30 80 30 80 40C80 50 70 50 70 50"
          stroke="#ca8a04"
          strokeWidth="4"
          fill="none"
        />
        <rect x="40" y="70" width="20" height="5" fill="#ca8a04" />
        <rect x="35" y="75" width="30" height="5" fill="#eab308" />
        <path
          d="M50 35L53 42H60L55 47L57 55L50 50L43 55L45 47L40 42H47L50 35Z"
          fill="#fef3c7"
        />
      </svg>
    ),
  };

  const content = (
    <div className={`${sizes[size]} ${className}`}>{iconMap[icon]}</div>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`${sizes[size]} ${className}`}
    >
      {iconMap[icon]}
    </motion.div>
  );
}
