import React from 'react';
import { cn } from '@/lib/utils';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function GlassButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  className,
  ...props 
}: GlassButtonProps) {
  const baseStyles = cn(
    "relative inline-flex items-center justify-center gap-2",
    "rounded-2xl font-body font-medium",
    "transition-all duration-300 ease-out",
    "backdrop-blur-glass",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  );

  const variantStyles = {
    primary: cn(
      "bg-primary/20 text-primary-foreground",
      "border border-primary/30",
      "shadow-glow-green",
      "hover:bg-primary/30 hover:shadow-glow-green-lg",
      "active:scale-[0.98]"
    ),
    secondary: cn(
      "bg-secondary/20 text-secondary-foreground",
      "border border-secondary/30",
      "shadow-glow-red",
      "hover:bg-secondary/30 hover:shadow-glow-red-lg",
      "active:scale-[0.98]"
    ),
    ghost: cn(
      "bg-foreground/5 text-foreground",
      "border border-foreground/10",
      "hover:bg-foreground/10",
      "active:scale-[0.98]"
    ),
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
