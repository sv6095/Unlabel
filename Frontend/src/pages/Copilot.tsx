import React, { useState, useRef, useEffect } from 'react';
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

// New Decision Engine Types
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

interface DecisionEngineResponse {
  quick_insight: QuickInsight;
  verdict: string; // "Daily", "Occasional", or "Limit Frequent Use"
  explanation: ConsumerExplanation;
  intent_classified: "quick_yes_no" | "comparison" | "risk_check" | "curiosity";
  key_signals: string[];
  ingredient_translations: IngredientTranslation[];
  uncertainty_flags: string[];
  structured_analysis?: any; // Optional technical details
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

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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
      // Use new decision engine endpoint
      const response = await api.post('/analyze/decision', { text });
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: 'decision',
        decision: response.data,
        timestamp: new Date(),
      });
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: 'text',
        content:
          "I'm having trouble connecting to my reasoning engine right now. Please try again.",
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
        className="flex-1 overflow-y-auto pt-24 pb-32 px-4 space-y-6"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-4',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div className="w-8 h-8 border border-border flex items-center justify-center shrink-0">
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
              <div className={cn('max-w-[85%]', (msg.type === 'analysis' || msg.type === 'decision') && 'w-full')}>
                {msg.type === 'text' && (
                  <div
                    className={cn(
                      'p-4 text-sm font-body leading-relaxed border',
                      msg.role === 'user'
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border bg-muted/30'
                    )}
                  >
                    {msg.content}
                  </div>
                )}

                {msg.type === 'image' && msg.imagePreview && (
                  <div className="border border-border w-48">
                    <img src={msg.imagePreview} alt="Upload" />
                  </div>
                )}

                {/* New Decision Engine Response - AI-Native Design */}
                {msg.type === 'decision' && msg.decision && (
                  <DecisionCard decision={msg.decision} />
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
            <div className="flex gap-4">
              <div className="w-8 h-8 border border-border" />
              <div className="border border-border px-4 py-3 text-sm text-muted-foreground">
                Thinking…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-background z-20">
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
