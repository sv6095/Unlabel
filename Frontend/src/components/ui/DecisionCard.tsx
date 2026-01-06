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
  uncertainty_reason?: string | null;
}

interface ConsumerExplanation {
  verdict: string;
  why_this_matters: string[];
  when_it_makes_sense: string;
  what_to_know: string;
}

interface DecisionData {
  quick_insight: QuickInsight;
  verdict: "Daily" | "Occasional" | "Limit Frequent Use" | string; // Allow string for flexibility
  explanation: ConsumerExplanation;
  intent_classified: "quick_yes_no" | "comparison" | "risk_check" | "curiosity" | string;
  key_signals: string[];
  ingredient_translations: IngredientTranslation[];
  uncertainty_flags: string[];
  structured_analysis?: {
    ingredient_summary?: {
      primary_components?: string[];
      added_sugars_present?: boolean;
      sweetener_type?: "none" | "natural" | "added" | "mixed";
      fiber_level?: "none" | "low" | "moderate" | "high";
      protein_level?: "none" | "low" | "moderate" | "high";
      fat_level?: "none" | "low" | "moderate" | "high";
      processing_level?: "low" | "moderate" | "high";
      ultra_processed_markers?: string[];
      ingredient_count?: number;
    };
    food_properties?: {
      sugar_dominant?: boolean;
      fiber_protein_support?: "none" | "weak" | "moderate" | "strong";
      energy_release_pattern?: "rapid" | "mixed" | "slow";
      satiety_support?: "low" | "moderate" | "high";
      formulation_complexity?: "simple" | "moderate" | "complex";
    };
    confidence_notes?: {
      data_completeness?: "high" | "medium" | "low";
      ambiguity_flags?: string[];
    };
  } | null;
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
  
  // Debug logging
  React.useEffect(() => {
    console.log('DecisionCard rendered with:', decision);
  }, [decision]);
  
  if (!decision) {
    return <div className="p-4 border border-border">No decision data available</div>;
  }
  
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
              {decision.quick_insight?.summary || 'Analyzing product...'}
            </p>

            {/* Uncertainty Warning */}
            {decision.quick_insight?.uncertainty_reason && (
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
                {decision.explanation?.why_this_matters?.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{point}</span>
                  </li>
                )) || <li className="text-sm text-muted-foreground">No details available</li>}
              </ul>
            </div>

            {/* When It Makes Sense */}
            <div>
              <h4 className="text-xs font-bold uppercase mb-2 text-muted-foreground">
                When It Makes Sense
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                {decision.explanation?.when_it_makes_sense || 'Consider your individual needs and preferences.'}
              </p>
            </div>

            {/* What To Know */}
            <div>
              <h4 className="text-xs font-bold uppercase mb-2 text-muted-foreground">
                What To Know
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                {decision.explanation?.what_to_know || 'This analysis is informational and not medical advice.'}
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

            {/* Intent Classification */}
            {decision.intent_classified && (
              <div className="p-3 border border-border bg-muted/20 rounded-lg">
                <h4 className="text-xs font-bold uppercase mb-2 text-muted-foreground">
                  Analysis Type
                </h4>
                <span className="text-xs px-3 py-1.5 bg-muted/30 rounded-full font-medium text-foreground capitalize">
                  {decision.intent_classified.replace('_', ' ')}
                </span>
              </div>
            )}

            {/* Structured Analysis (Technical Details) - Collapsible */}
            {decision.structured_analysis && (
              <div>
                <details className="group">
                  <summary className="cursor-pointer text-xs font-bold uppercase text-muted-foreground mb-3 list-none">
                    <div className="flex items-center gap-2">
                      <span>Technical Details</span>
                      <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
                    </div>
                  </summary>
                  <div className="mt-3 space-y-4 p-4 bg-muted/10 border border-border rounded-lg">
                    {/* Ingredient Summary */}
                    {decision.structured_analysis.ingredient_summary && (
                      <div>
                        <h5 className="text-xs font-semibold text-foreground mb-2">Ingredient Summary</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {decision.structured_analysis.ingredient_summary.primary_components && (
                            <p><strong>Primary:</strong> {decision.structured_analysis.ingredient_summary.primary_components.join(', ')}</p>
                          )}
                          {decision.structured_analysis.ingredient_summary.added_sugars_present !== undefined && (
                            <p><strong>Added Sugars:</strong> {decision.structured_analysis.ingredient_summary.added_sugars_present ? 'Yes' : 'No'}</p>
                          )}
                          {decision.structured_analysis.ingredient_summary.sweetener_type && (
                            <p><strong>Sweetener:</strong> {decision.structured_analysis.ingredient_summary.sweetener_type}</p>
                          )}
                          {decision.structured_analysis.ingredient_summary.fiber_level && (
                            <p><strong>Fiber:</strong> {decision.structured_analysis.ingredient_summary.fiber_level}</p>
                          )}
                          {decision.structured_analysis.ingredient_summary.protein_level && (
                            <p><strong>Protein:</strong> {decision.structured_analysis.ingredient_summary.protein_level}</p>
                          )}
                          {decision.structured_analysis.ingredient_summary.fat_level && (
                            <p><strong>Fat:</strong> {decision.structured_analysis.ingredient_summary.fat_level}</p>
                          )}
                          {decision.structured_analysis.ingredient_summary.processing_level && (
                            <p><strong>Processing:</strong> {decision.structured_analysis.ingredient_summary.processing_level}</p>
                          )}
                          {decision.structured_analysis.ingredient_summary.ingredient_count !== undefined && (
                            <p><strong>Ingredient Count:</strong> {decision.structured_analysis.ingredient_summary.ingredient_count}</p>
                          )}
                          {decision.structured_analysis.ingredient_summary.ultra_processed_markers && decision.structured_analysis.ingredient_summary.ultra_processed_markers.length > 0 && (
                            <p><strong>Ultra-processed Markers:</strong> {decision.structured_analysis.ingredient_summary.ultra_processed_markers.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Food Properties */}
                    {decision.structured_analysis.food_properties && (
                      <div>
                        <h5 className="text-xs font-semibold text-foreground mb-2">Food Properties</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {decision.structured_analysis.food_properties.sugar_dominant !== undefined && (
                            <p><strong>Sugar Dominant:</strong> {decision.structured_analysis.food_properties.sugar_dominant ? 'Yes' : 'No'}</p>
                          )}
                          {decision.structured_analysis.food_properties.fiber_protein_support && (
                            <p><strong>Fiber/Protein Support:</strong> {decision.structured_analysis.food_properties.fiber_protein_support}</p>
                          )}
                          {decision.structured_analysis.food_properties.energy_release_pattern && (
                            <p><strong>Energy Release:</strong> {decision.structured_analysis.food_properties.energy_release_pattern}</p>
                          )}
                          {decision.structured_analysis.food_properties.satiety_support && (
                            <p><strong>Satiety Support:</strong> {decision.structured_analysis.food_properties.satiety_support}</p>
                          )}
                          {decision.structured_analysis.food_properties.formulation_complexity && (
                            <p><strong>Complexity:</strong> {decision.structured_analysis.food_properties.formulation_complexity}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Confidence Notes */}
                    {decision.structured_analysis.confidence_notes && (
                      <div>
                        <h5 className="text-xs font-semibold text-foreground mb-2">Confidence</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {decision.structured_analysis.confidence_notes.data_completeness && (
                            <p><strong>Data Completeness:</strong> {decision.structured_analysis.confidence_notes.data_completeness}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

