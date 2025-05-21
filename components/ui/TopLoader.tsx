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
      }, 200);
      return () => clearTimeout(timer);
    }

    // Start with a more aggressive initial progress
    setProgress(35);
    
    // Faster incremental progress simulation with more aggressive jumps
    const timer1 = setTimeout(() => setProgress(55), 50);
    const timer2 = setTimeout(() => setProgress(75), 200);
    const timer3 = setTimeout(() => setProgress(90), 400);
    
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
      transition={{ duration: 0.2 }}
    >
    <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary/20 to-transparent h-16 z-50 border-1 border-x-0 border-b-0 border-t-primary/40"/>
      <motion.div 
        className="h-full bg-gradient-to-r from-primary via-primary to-accent animate-pulse"
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ 
          duration: progress === 100 ? 0.15 : 0.3,
          ease: 'easeOut'
        }}
      />
    </motion.div>
  );
} 