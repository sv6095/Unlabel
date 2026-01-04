import React, { useState } from 'react';
import { Camera, Type, CornerRightUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useAutoResizeTextarea } from '@/components/hooks/use-auto-resize-textarea';

interface AIInputProps {
  onSubmit?: (text: string) => void;
  onCameraClick?: () => void;
  placeholder?: string;
  className?: string;
}

export function AIInput({ 
  onSubmit, 
  onCameraClick,
  placeholder = "Paste ingredients or describe what you're considering…",
  className 
}: AIInputProps) {
  const [inputValue, setInputValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 56,
    maxHeight: 200,
  });

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit?.(inputValue.trim());
      setInputValue("");
      adjustHeight(true);
    }
  };

  return (
    <div className={cn("w-full max-w-lg mx-auto", className)}>
      <div className="glass-card-green p-2 animate-breathe">
        <div className="relative">
          {/* Camera Button */}
          <button
            onClick={onCameraClick}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2",
              "w-10 h-10 rounded-xl",
              "bg-primary/20 border border-primary/30",
              "flex items-center justify-center",
              "transition-all duration-300",
              "hover:bg-primary/30 hover:scale-105",
              "text-primary-foreground"
            )}
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={placeholder}
            className={cn(
              "w-full pl-16 pr-14 py-4",
              "bg-transparent border-none",
              "text-foreground placeholder:text-muted-foreground",
              "font-body text-base",
              "resize-none focus:ring-0 focus:outline-none",
              "min-h-[56px]"
            )}
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "w-10 h-10 rounded-xl",
              "bg-primary/20 border border-primary/30",
              "flex items-center justify-center",
              "transition-all duration-300",
              inputValue.trim() 
                ? "opacity-100 hover:bg-primary/30 hover:scale-105" 
                : "opacity-30",
              "text-primary-foreground"
            )}
          >
            <CornerRightUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Poetic hint */}
      <p className="text-center text-muted-foreground text-sm mt-4 font-body opacity-60">
        Let me take a look.
      </p>
    </div>
  );
}
