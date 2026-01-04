import React, { useMemo } from 'react';

interface Seed {
  id: number;
  left: string;
  animationDelay: string;
  animationDuration: string;
  size: number;
  opacity: number;
}

export function FloatingSeeds() {
  const seeds = useMemo<Seed[]>(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 20}s`,
      animationDuration: `${15 + Math.random() * 15}s`,
      size: 4 + Math.random() * 6,
      opacity: 0.1 + Math.random() * 0.3,
    }));
  }, []);

  return (
    <div className="seeds-bg overflow-hidden">
      {seeds.map((seed) => (
        <div
          key={seed.id}
          className="absolute rounded-full bg-foreground/20 animate-seed-drift"
          style={{
            left: seed.left,
            width: seed.size,
            height: seed.size * 1.8,
            opacity: seed.opacity,
            animationDelay: seed.animationDelay,
            animationDuration: seed.animationDuration,
            borderRadius: '40% 40% 50% 50%',
          }}
        />
      ))}
    </div>
  );
}
