import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface OrbitalItem {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  variant?: "green" | "neutral" | "red";
}

interface RadialOrbitalTimelineProps {
  items: OrbitalItem[];
}

export function RadialOrbitalTimeline({ items }: RadialOrbitalTimelineProps) {
  const [rotation, setRotation] = useState(0);
  const isMobile = useIsMobile();
  
  // Responsive values
  const radius = isMobile ? 100 : 180;
  const orbitSize = isMobile ? 200 : 360;
  const containerHeight = isMobile ? 320 : 420;

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => (r + 0.15) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full flex items-center justify-center overflow-visible px-4 sm:px-0" style={{ minHeight: `${containerHeight}px` }}>
      <div className="relative w-full max-w-[360px] mx-auto" style={{ height: `${containerHeight}px` }}>
        {/* Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 border border-border bg-background z-10" />

        {/* Orbit */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-border/40 rounded-full"
          style={{ 
            width: `${orbitSize}px`, 
            height: `${orbitSize}px`,
            marginLeft: `-${orbitSize / 2}px`,
            marginTop: `-${orbitSize / 2}px`
          }}
        />

        {items.map((item, index) => {
          const angle = (360 / items.length) * index + rotation;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              className="absolute top-1/2 left-1/2"
              style={{ 
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
              }}
            >
              <div
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 border flex items-center justify-center",
                  item.variant === "green" && "border-primary",
                  item.variant === "red" && "border-secondary",
                  item.variant === "neutral" && "border-border"
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </div>

              <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 text-center w-32 sm:w-40">
                <p className="font-display text-xs sm:text-sm text-foreground">
                  {item.title}
                </p>
                <p className="font-body text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
