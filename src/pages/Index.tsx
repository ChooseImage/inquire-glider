
import React, { useState } from "react";
import { toast } from "sonner";
import InputDialog from "@/components/InputDialog";
import ResponseDisplay from "@/components/ResponseDisplay";
import Background from "@/components/Background";
import Header from "@/components/Header";
import { streamQuestion } from "@/services/api";

const Index = () => {
  const [aiResponse, setAiResponse] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (question: string) => {
    try {
      setIsLoading(true);
      setAiResponse("");
      setResults([]);

      await streamQuestion(
        question,
        (text) => {
          setAiResponse(text);
        },
        (result) => {
          setResults((prev) => [...prev, result]);
        }
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while processing your question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Background>
      <div className="container px-4 py-10 mx-auto min-h-screen flex flex-col items-center justify-center">
        <Header />
        
        <main className="w-full max-w-3xl mx-auto mt-6 space-y-8 flex-1 flex flex-col items-center justify-center">
          <div className="w-full animate-slide-up">
            <InputDialog onSubmit={handleSubmit} isLoading={isLoading} />
            <ResponseDisplay 
              aiResponse={aiResponse} 
              results={results} 
              isLoading={isLoading} 
            />
          </div>
        </main>
        
        <footer className="w-full py-4 text-center text-sm text-muted-foreground animate-fade-in">
          <p>Designed with precision and simplicity</p>
        </footer>
      </div>
    </Background>
  );
};

export default Index;
