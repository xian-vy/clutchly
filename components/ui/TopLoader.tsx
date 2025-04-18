'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TopLoaderProps {
  isLoading?: boolean;
}

export function TopLoader({ isLoading = true }: TopLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!isLoading) {
      // When loading completes, quickly fill to 100% then fade out
      setProgress(100);
      const timer = setTimeout(() => {
        setOpacity(0);
      }, 300);
      return () => clearTimeout(timer);
    }

    // Start with a quick initial progress
    setProgress(20);
    
    // Slower incremental progress simulation
    const timer1 = setTimeout(() => setProgress(40), 100);
    const timer2 = setTimeout(() => setProgress(60), 400);
    const timer3 = setTimeout(() => setProgress(80), 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isLoading]);

  return (
    <motion.div 
      className="fixed top-0 left-0 z-50 w-full h-1 bg-transparent"
      initial={{ opacity: 1 }}
      animate={{ opacity }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="h-full bg-gradient-to-r from-primary via-primary/90 to-accent"
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ 
          duration: progress === 100 ? 0.2 : 0.5,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
} 