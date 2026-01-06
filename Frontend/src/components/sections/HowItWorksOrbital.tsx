import React from "react";
import {
  Camera,
  Brain,
  Lightbulb,
  Scale,
  HelpCircle,
} from "lucide-react";
import { RadialOrbitalTimeline } from "@/components/ui/radial-orbital-timeline";

const items = [
  {
    id: 1,
    icon: Camera,
    title: "Show",
    description: "Scan a food label or paste ingredients.",
    variant: "green" as const,
  },
  {
    id: 2,
    icon: Brain,
    title: "Understand",
    description: "The AI processes context, not just data.",
    variant: "neutral" as const,
  },
  {
    id: 3,
    icon: Lightbulb,
    title: "Learn",
    description: "One clear insight. Expand when you want.",
    variant: "green" as const,
  },
  {
    id: 4,
    icon: Scale,
    title: "Trade-Offs",
    description: "Balanced language. No fear-mongering.",
    variant: "neutral" as const,
  },
  {
    id: 5,
    icon: HelpCircle,
    title: "Uncertainty",
    description: "Explicit honesty about limits.",
    variant: "red" as const,
  },
];

export function HowItWorksOrbital() {
  return (
    <section id="how-it-works" className="py-16 sm:py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-16">
        <h2 className="font-display text-2xl sm:text-4xl text-foreground mb-4">
          Intelligence, not information
        </h2>
        <p className="font-body text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          The system understands food — and it understands you.
        </p>
      </div>

      <div className="w-full overflow-visible">
        <RadialOrbitalTimeline items={items} />
      </div>
    </section>
  );
}
