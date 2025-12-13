import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { slideUp } from '../../utils/animations';

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export default function Card({ children, className = '', animate = true }: CardProps) {
  const baseStyles = 'bg-white rounded-2xl shadow-lg p-6';

  if (!animate) {
    return <div className={`${baseStyles} ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`${baseStyles} ${className}`}
    >
      {children}
    </motion.div>
  );
}
