import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/ui/hero";
import { HowItWorksOrbital } from "@/components/sections/HowItWorksOrbital";
import LightRays from "@/components/ui/LightRays";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Light rays background */}
      <div className="absolute inset-0 z-0 min-h-screen">
        <LightRays
          raysOrigin="top-center"
          raysColor="#4ade80"
          raysSpeed={0.6}
          lightSpread={1.2}
          rayLength={1.1}
          fadeDistance={1.4}
          saturation={0.6}
          followMouse={true}
          mouseInfluence={0.04}
          noiseAmount={0.02}
          distortion={0.02}
        />
      </div>

      {/* Foreground */}
      <div className="relative z-10 overflow-x-hidden">
        <Header />

        <Hero
          title={
            <>Unlabel</> }
              
            
          
          subtitle="Understand what you're
              about to eat AI-native food intelligence that explains ingredients at the moment decisions matter."
          actions={[
            { label: "Analyze Food", href: "/analyze", variant: "default" },
          ]}
          titleClassName="font-extrabold"
          subtitleClassName="max-w-2xl mx-auto"
        />

        <div className="overflow-visible">
          <HowItWorksOrbital />
        </div>
      </div>
    </div>
  );
}
