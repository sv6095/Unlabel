import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const radius = 180;

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => (r + 0.15) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[420px] flex items-center justify-center">
      {/* Core */}
      <div className="absolute w-10 h-10 border border-border bg-background z-10" />

      {/* Orbit */}
      <div className="absolute w-[360px] h-[360px] border border-border/40 rounded-full" />

      {items.map((item, index) => {
        const angle = (360 / items.length) * index + rotation;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const Icon = item.icon;

        return (
          <motion.div
            key={item.id}
            className="absolute"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <div
              className={cn(
                "w-12 h-12 border flex items-center justify-center",
                item.variant === "green" && "border-primary",
                item.variant === "red" && "border-secondary",
                item.variant === "neutral" && "border-border"
              )}
            >
              <Icon className="w-5 h-5 text-foreground" />
            </div>

            <div className="absolute top-14 left-1/2 -translate-x-1/2 text-center w-40">
              <p className="font-display text-sm text-foreground">
                {item.title}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
