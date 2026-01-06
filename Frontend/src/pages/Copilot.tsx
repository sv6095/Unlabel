import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { AIInput } from '@/components/ui/AIInput';
import { FoodScanner } from '@/components/ui/FoodScanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { DecisionCard } from '@/components/ui/DecisionCard';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// Types
interface TradeOffs {
  pros: string[];
  cons: string[];
}

interface AnalysisResult {
  insight: string;
  detailed_reasoning: string;
  trade_offs: TradeOffs;
  uncertainty_note?: string;
}

// New Decision Engine Types - Matching Backend Schemas
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
  why_this_matters: string[]; // Max 3 bullet points
  when_it_makes_sense: string;
  what_to_know: string;
}

// Structured Analysis Types (for technical details)
interface IngredientSummary {
  primary_components: string[];
  added_sugars_present: boolean;
  sweetener_type: "none" | "natural" | "added" | "mixed";
  fiber_level: "none" | "low" | "moderate" | "high";
  protein_level: "none" | "low" | "moderate" | "high";
  fat_level: "none" | "low" | "moderate" | "high";
  processing_level: "low" | "moderate" | "high";
  ultra_processed_markers: string[];
  ingredient_count: number;
}

interface FoodProperties {
  sugar_dominant: boolean;
  fiber_protein_support: "none" | "weak" | "moderate" | "strong";
  energy_release_pattern: "rapid" | "mixed" | "slow";
  satiety_support: "low" | "moderate" | "high";
  formulation_complexity: "simple" | "moderate" | "complex";
}

interface ConfidenceNotes {
  data_completeness: "high" | "medium" | "low";
  ambiguity_flags: string[];
}

interface StructuredIngredientAnalysis {
  ingredient_summary: IngredientSummary;
  food_properties: FoodProperties;
  confidence_notes: ConfidenceNotes;
}

interface DecisionRequest {
  text: string;
  user_intent?: "quick_yes_no" | "comparison" | "risk_check" | "curiosity" | null;
  include_nutrition?: string | null;
}

interface DecisionEngineResponse {
  // Instant understanding (show first)
  quick_insight: QuickInsight;
  
  // Consumer-facing (primary)
  verdict: "Daily" | "Occasional" | "Limit Frequent Use" | string; // Allow string for flexibility
  explanation: ConsumerExplanation;
  
  // Supporting information
  intent_classified: "quick_yes_no" | "comparison" | "risk_check" | "curiosity" | string;
  key_signals: string[]; // Top signals that influenced the decision
  
  // Ingredient translation (explain complex terms)
  ingredient_translations: IngredientTranslation[];
  
  // Uncertainty flags
  uncertainty_flags: string[];
  
  // Technical details (optional, for transparency/debugging)
  structured_analysis?: StructuredIngredientAnalysis | null;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  type: 'text' | 'image' | 'analysis' | 'decision';
  content?: string;
  imagePreview?: string;
  analysis?: AnalysisResult; // Legacy format
  decision?: DecisionEngineResponse; // New decision engine format
  timestamp: Date;
}

const Copilot = () => {

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      type: 'text',
      content:
        "I'm your Unlabel Co-pilot. Show me a label or ask about ingredients, and I'll help you understand the trade-offs.",
      timestamp: new Date(),
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleTextSubmit = async (text: string) => {
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: text,
      timestamp: new Date(),
    });

    setIsTyping(true);

    try {
      // Use new decision engine endpoint - DO NOT fall back to old endpoint
      const request: DecisionRequest = { text };
      console.log('Calling /analyze/decision with:', request);
      
      const response = await api.post<DecisionEngineResponse>('/analyze/decision', request);
      
      // Ensure response data matches expected structure
      const decisionData: DecisionEngineResponse = response.data;
      
      // Log for debugging
      console.log('Decision engine response:', decisionData);
      console.log('Response keys:', Object.keys(decisionData));
      
      // Validate that we have the required fields
      if (!decisionData) {
        console.error('No response data received');
        throw new Error('No response from decision engine');
      }
      
      // Check if we got the old format by mistake (has trade_offs instead of explanation)
      if ('trade_offs' in decisionData || 'insight' in decisionData) {
        console.error('Received old format response! Expected DecisionEngineResponse but got AnalysisResponse');
        throw new Error('Backend returned old format. Please check backend endpoint.');
      }
      
      // Ensure required fields exist (with fallbacks)
      if (!decisionData.quick_insight) {
        decisionData.quick_insight = { summary: 'Analysis complete.', uncertainty_reason: null };
      }
      if (!decisionData.quick_insight.summary) {
        decisionData.quick_insight.summary = 'Analysis complete.';
      }
      
      if (!decisionData.verdict) {
        decisionData.verdict = 'Occasional';
      }
      
      if (!decisionData.explanation) {
        decisionData.explanation = {
          verdict: decisionData.verdict,
          why_this_matters: ['Product analyzed based on ingredient profile'],
          when_it_makes_sense: 'Consider your individual dietary needs.',
          what_to_know: 'This analysis is informational.'
        };
      }
      
      // Ensure explanation fields exist
      if (!decisionData.explanation.why_this_matters) {
        decisionData.explanation.why_this_matters = [];
      }
      if (!decisionData.explanation.when_it_makes_sense) {
        decisionData.explanation.when_it_makes_sense = 'Consider your individual dietary needs.';
      }
      if (!decisionData.explanation.what_to_know) {
        decisionData.explanation.what_to_know = 'This analysis is informational.';
      }
      
      // Ensure we have key_signals
      if (!decisionData.key_signals) {
        decisionData.key_signals = [];
      }
      
      // Ensure we have ingredient_translations
      if (!decisionData.ingredient_translations) {
        decisionData.ingredient_translations = [];
      }
      
      // Ensure we have uncertainty_flags
      if (!decisionData.uncertainty_flags) {
        decisionData.uncertainty_flags = [];
      }
      
      // Ensure intent_classified exists
      if (!decisionData.intent_classified) {
        decisionData.intent_classified = 'curiosity';
      }
      
      // structured_analysis is optional, so we don't need to set a default
      
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: 'decision',
        decision: decisionData,
        timestamp: new Date(),
      });
    } catch (error: any) {
      console.error('Decision engine error:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: 'text',
        content:
          `I'm having trouble connecting to my reasoning engine right now. Error: ${error.message || 'Unknown error'}. Please check the console for details.`,
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageCapture = async (file: File, preview: string) => {
    setShowScanner(false);

    addMessage({
      id: Date.now().toString(),
      role: 'user',
      type: 'image',
      imagePreview: preview,
      content: 'Analyze this label',
      timestamp: new Date(),
    });

    setIsTyping(true);

    try {
      // For images, we'll still use the legacy endpoint for now
      // TODO: Update backend to support image input for decision engine
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/analyze/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: 'analysis',
        analysis: response.data,
        timestamp: new Date(),
      });
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: 'text',
        content: "I couldn't analyze that image. Please try again.",
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header />

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pt-20 sm:pt-24 pb-24 sm:pb-28 px-2 sm:px-4 space-y-4 sm:space-y-6"
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
        }}
      >
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-4',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 border border-border flex items-center justify-center shrink-0">
                {msg.role === 'ai' ? (
                  <img
                    src="/Logo.png"
                    alt="AI"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-foreground">
                    U
                  </span>
                )}
              </div>

              {/* Content */}
              <div className={cn('max-w-[85%] sm:max-w-[85%]', (msg.type === 'analysis' || msg.type === 'decision') && 'w-full max-w-full')}>
                {msg.type === 'text' && (
                  <div
                    className={cn(
                      'p-3 sm:p-4 text-sm font-body leading-relaxed border break-words',
                      msg.role === 'user'
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border bg-muted/30'
                    )}
                  >
                    {msg.content}
                  </div>
                )}

                {msg.type === 'image' && msg.imagePreview && (
                  <div className="border border-border w-full sm:w-48 max-w-full">
                    <img src={msg.imagePreview} alt="Upload" className="w-full h-auto" />
                  </div>
                )}

                {/* New Decision Engine Response - AI-Native Design */}
                {msg.type === 'decision' && msg.decision ? (
                  <DecisionCard decision={msg.decision} />
                ) : msg.type === 'decision' && (
                  <div className="p-4 border border-border bg-muted/30 text-sm text-muted-foreground">
                    Decision data is loading...
                  </div>
                )}

                {/* Legacy Analysis Format (for backward compatibility) */}
                {msg.type === 'analysis' && msg.analysis && (
                  <GlassCard variant="green" className="p-6">
                    <h3 className="font-display text-xl mb-3">
                      {msg.analysis.insight}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mb-6">
                      {msg.analysis.detailed_reasoning}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border border-border p-4">
                        <h4 className="text-xs font-bold uppercase mb-2">
                          Benefits
                        </h4>
                        <ul className="space-y-2">
                          {msg.analysis.trade_offs.pros.map((p, i) => (
                            <li key={i} className="text-xs text-muted-foreground">
                              • {p}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border border-border p-4">
                        <h4 className="text-xs font-bold uppercase mb-2">
                          Trade-offs
                        </h4>
                        <ul className="space-y-2">
                          {msg.analysis.trade_offs.cons.map((c, i) => (
                            <li key={i} className="text-xs text-muted-foreground">
                              • {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {msg.analysis.uncertainty_note && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs italic text-muted-foreground">
                          {msg.analysis.uncertainty_note}
                        </p>
                      </div>
                    )}
                  </GlassCard>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 border border-border shrink-0" />
              <div className="border border-border px-3 sm:px-4 py-2 sm:py-3 text-sm text-muted-foreground">
                Thinking…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 w-full p-2 sm:p-4 bg-background z-20 border-t border-border/30">
        <AIInput
          onSubmit={handleTextSubmit}
          onCameraClick={() => setShowScanner(true)}
          placeholder="Ask about ingredients or show me a label..."
        />
      </div>

      {showScanner && (
        <FoodScanner
          onCapture={handleImageCapture}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default Copilot;
