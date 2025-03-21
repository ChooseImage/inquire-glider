
import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResponseDisplayProps {
  aiResponse: string;
  results: any[];
  isLoading: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  aiResponse,
  results,
  isLoading,
}) => {
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [aiResponse, results]);

  if (!aiResponse && results.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4 glass-card animate-fade-in">
      <CardContent className="p-4">
        <div
          ref={responseRef}
          className="max-h-[50vh] overflow-y-auto prose prose-sm prose-gray"
        >
          {isLoading && !aiResponse && (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-100"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-500"></div>
            </div>
          )}

          {aiResponse && (
            <div className="whitespace-pre-wrap break-words animate-slide-up">
              {aiResponse}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50 animate-slide-up">
              <h3 className="text-sm font-medium mb-2">Results</h3>
              {results.map((result, index) => (
                <div key={index} className="mb-2 p-2 bg-muted rounded-md text-sm">
                  <pre className="whitespace-pre-wrap break-words overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseDisplay;
