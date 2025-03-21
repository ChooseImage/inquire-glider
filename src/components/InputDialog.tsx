
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface InputDialogProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const InputDialog: React.FC<InputDialogProps> = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question);
      setQuestion("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card animate-fade-in">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ask any question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all duration-200"
            disabled={isLoading}
            autoFocus
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!question.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InputDialog;
