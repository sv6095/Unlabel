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
      <div className="glass-card-green p-1.5 sm:p-2 animate-breathe">
        <div className="relative">
          {/* Camera Button */}
          <button
            onClick={onCameraClick}
            className={cn(
              "absolute left-2 sm:left-3 top-1/2 -translate-y-1/2",
              "w-8 h-8 sm:w-10 sm:h-10 rounded-xl",
              "bg-primary/20 border border-primary/30",
              "flex items-center justify-center",
              "transition-all duration-300",
              "hover:bg-primary/30 hover:scale-105 active:scale-95",
              "text-primary-foreground touch-manipulation"
            )}
            aria-label="Open camera"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
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
              "w-full pl-12 sm:pl-16 pr-11 sm:pr-14 py-3 sm:py-4",
              "bg-transparent border-none",
              "text-foreground placeholder:text-muted-foreground",
              "font-body text-sm sm:text-base",
              "resize-none focus:ring-0 focus:outline-none",
              "min-h-[48px] sm:min-h-[56px]"
            )}
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className={cn(
              "absolute right-2 sm:right-3 top-1/2 -translate-y-1/2",
              "w-8 h-8 sm:w-10 sm:h-10 rounded-xl",
              "bg-primary/20 border border-primary/30",
              "flex items-center justify-center",
              "transition-all duration-300",
              inputValue.trim() 
                ? "opacity-100 hover:bg-primary/30 hover:scale-105 active:scale-95" 
                : "opacity-30",
              "text-primary-foreground touch-manipulation"
            )}
            aria-label="Submit"
          >
            <CornerRightUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Poetic hint */}
      <p className="text-center text-muted-foreground text-xs sm:text-sm mt-2 sm:mt-4 font-body opacity-60">
        Let me take a look.
      </p>
    </div>
  );
}
