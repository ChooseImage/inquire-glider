
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  placeholder?: string;
  position?: 'bottom-right' | 'bottom-left';
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  isLoading,
  placeholder = "What've you got for me this time?",
  position = 'bottom-right'
}) => {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus the input when / is pressed
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className={cn(
        'fixed z-50 p-4',
        position === 'bottom-right' ? 'bottom-8 right-8' : 'bottom-8 left-8'
      )}
    >
      <form 
        onSubmit={handleSubmit}
        className={cn(
          'transition-all duration-300 ease-in-out',
          'glass-panel rounded-full overflow-hidden',
          'flex items-center',
          'w-auto shadow-lg border border-white/30',
          isFocused ? 'w-80 sm:w-96 ring-2 ring-primary/20' : 'w-64 sm:w-72',
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            'flex-1 px-4 py-3 bg-transparent outline-none',
            'text-foreground placeholder:text-muted-foreground',
            'transition-all duration-200'
          )}
        />
        <div className="pr-1">
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              'transition-all duration-200 ease-in-out',
              prompt.trim() && !isLoading
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
            aria-label="Send"
          >
            <Send size={18} className={isLoading ? 'animate-pulse' : ''} />
          </button>
        </div>
      </form>
      <div className="mt-2 ml-4 text-xs text-muted-foreground">
        Press / to focus
      </div>
    </div>
  );
};

export default ChatInput;
