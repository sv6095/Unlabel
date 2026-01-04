import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  variant?: 'green' | 'red' | 'neutral';
  expandable?: boolean;
  defaultExpanded?: boolean;
}

export function InsightCard({
  icon,
  title,
  content,
  variant = 'neutral',
  expandable = true,
  defaultExpanded = false,
}: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <GlassCard
      variant={variant}
      className={cn(
        "transition-spring",
        expandable && "cursor-pointer"
      )}
      onClick={expandable ? () => setIsExpanded(!isExpanded) : undefined}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          variant === 'green' && "bg-primary/20 text-primary-foreground",
          variant === 'red' && "bg-secondary/20 text-secondary-foreground",
          variant === 'neutral' && "bg-foreground/10 text-foreground"
        )}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg text-foreground">
              {title}
            </h3>
            {expandable && (
              <ChevronDown 
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-300",
                  isExpanded && "rotate-180"
                )}
              />
            )}
          </div>

          {/* Expandable content */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-500 ease-out",
              isExpanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
            )}
          >
            <p className="font-body text-muted-foreground leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
