import React from 'react';
import { cn } from '@/lib/utils';

interface AIWaveformProps {
  variant?: 'green' | 'red' | 'mixed';
  className?: string;
}

export function AIWaveform({ variant = 'green', className }: AIWaveformProps) {
  const bars = 12;
  
  const getBarColor = (index: number) => {
    if (variant === 'green') return 'bg-primary';
    if (variant === 'red') return 'bg-secondary';
    // Mixed: gradient from green to red
    return index < bars / 2 ? 'bg-primary' : 'bg-secondary';
  };

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full animate-waveform",
            getBarColor(i)
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: '4px',
          }}
        />
      ))}
    </div>
  );
}
