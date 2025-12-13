import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  className?: string;
}

export default function ProgressBar({
  current,
  total,
  showPercentage = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-fuchsia-600">
          Avance {current} de {total}
        </span>
        {showPercentage && (
          <span className="text-sm font-bold text-orange-500">{percentage}%</span>
        )}
      </div>
      <div className="w-full h-4 bg-fuchsia-100 rounded-full overflow-hidden border-2 border-fuchsia-300">
        <motion.div
          className="h-full bg-gradient-to-r from-fuchsia-500 to-orange-400 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 shimmer" />
        </motion.div>
      </div>
    </div>
  );
}
