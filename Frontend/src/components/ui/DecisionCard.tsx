import React, { useState } from 'react';
import { ChevronDown, Info, AlertCircle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';

interface IngredientTranslation {
  term: string;
  simple_explanation: string;
  category: string;
}

interface QuickInsight {
  summary: string;
  uncertainty_reason?: string;
}

interface ConsumerExplanation {
  verdict: string;
  why_this_matters: string[];
  when_it_makes_sense: string;
  what_to_know: string;
}

interface DecisionData {
  quick_insight: QuickInsight;
  verdict: string;
  explanation: ConsumerExplanation;
  key_signals: string[];
  ingredient_translations: IngredientTranslation[];
  uncertainty_flags: string[];
}

interface DecisionCardProps {
  decision: DecisionData;
}

const getVerdictConfig = (verdict: string) => {
  switch (verdict) {
    case 'Daily':
      return {
        icon: CheckCircle2,
        color: 'text-primary',
        bgColor: 'bg-primary/20',
        borderColor: 'border-primary/30',
        label: 'Daily',
      };
    case 'Occasional':
      return {
        icon: HelpCircle,
        color: 'text-foreground',
        bgColor: 'bg-foreground/10',
        borderColor: 'border-border',
        label: 'Occasional',
      };
    case 'Limit Frequent Use':
      return {
        icon: XCircle,
        color: 'text-secondary',
        bgColor: 'bg-secondary/20',
        borderColor: 'border-secondary/30',
        label: 'Limit Use',
      };
    default:
      return {
        icon: Info,
        color: 'text-foreground',
        bgColor: 'bg-foreground/10',
        borderColor: 'border-border',
        label: verdict,
      };
  }
};

export function DecisionCard({ decision }: DecisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const verdictConfig = getVerdictConfig(decision.verdict);

  return (
    <GlassCard
      variant={decision.verdict === 'Daily' ? 'green' : decision.verdict === 'Occasional' ? 'neutral' : 'red'}
      className="p-0 overflow-hidden"
    >
      {/* Quick Insight - Always Visible */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-base font-body text-foreground leading-relaxed">
              {decision.quick_insight.summary}
            </p>

            {/* Uncertainty Warning */}
            {decision.quick_insight.uncertainty_reason && (
              <div className="mt-3 flex items-start gap-2 p-2 bg-muted/30 rounded border border-border">
                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {decision.quick_insight.uncertainty_reason}
                </p>
              </div>
            )}
          </div>

          {/* Verdict Badge */}
          <div className={cn(
            "flex flex-col items-center justify-center px-4 py-3 rounded-lg border shrink-0",
            verdictConfig.bgColor,
            verdictConfig.borderColor
          )}>
            <verdictConfig.icon className={cn("w-6 h-6 mb-1", verdictConfig.color)} />
            <span className={cn("text-xs font-bold uppercase", verdictConfig.color)}>
              {verdictConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="transition-all duration-300">
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">
            {isExpanded ? 'Hide details' : 'Show details'}
          </span>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-300",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        {/* Expanded Content */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-500",
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="p-6 space-y-6 border-t border-border">
            {/* Why This Matters */}
            <div>
              <h4 className="text-xs font-bold uppercase mb-3 text-muted-foreground">
                Why This Matters
              </h4>
              <ul className="space-y-2">
                {decision.explanation.why_this_matters.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* When It Makes Sense */}
            <div>
              <h4 className="text-xs font-bold uppercase mb-2 text-muted-foreground">
                When It Makes Sense
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                {decision.explanation.when_it_makes_sense}
              </p>
            </div>

            {/* What To Know */}
            <div>
              <h4 className="text-xs font-bold uppercase mb-2 text-muted-foreground">
                What To Know
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                {decision.explanation.what_to_know}
              </p>
            </div>

            {/* Key Signals */}
            {decision.key_signals && decision.key_signals.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase mb-3 text-muted-foreground">
                  Key Signals
                </h4>
                <div className="flex flex-wrap gap-2">
                  {decision.key_signals.map((signal, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 text-xs border border-border bg-muted/30 rounded-full font-medium"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredient Translations */}
            {decision.ingredient_translations && decision.ingredient_translations.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase mb-3 text-muted-foreground">
                  Ingredient Explanations
                </h4>
                <div className="space-y-3">
                  {decision.ingredient_translations.map((translation, i) => (
                    <div
                      key={i}
                      className="p-3 border border-border bg-muted/20 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {translation.term}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground capitalize">
                          {translation.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {translation.simple_explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uncertainty Flags */}
            {decision.uncertainty_flags && decision.uncertainty_flags.length > 0 && (
              <div className="p-3 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">
                    Note
                  </h4>
                </div>
                <ul className="space-y-1">
                  {decision.uncertainty_flags.map((flag, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      • {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

