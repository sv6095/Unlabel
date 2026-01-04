import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'green' | 'red';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function GlassCard({ 
  children, 
  variant = 'neutral', 
  className,
  onClick,
  hover = false,
  style
}: GlassCardProps) {
  const variantClasses = {
    neutral: 'glass-card-neutral',
    green: 'glass-card-green',
    red: 'glass-card-red',
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        "p-6 transition-smooth",
        hover && "hover:scale-[1.02] cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
