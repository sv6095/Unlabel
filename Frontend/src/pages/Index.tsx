import React from 'react';
import { FloatingSeeds } from '@/components/ui/FloatingSeeds';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { HowItWorks } from '@/components/sections/HowItWorksOrbital';

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <FloatingSeeds />
      <Header />
      <main className="overflow-visible">
        <HeroSection />
        <HowItWorks />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-border/30">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-body text-sm text-muted-foreground">
            Quiet confidence. Organic intelligence. Future-ready calm.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
