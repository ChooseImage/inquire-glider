
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Background from "@/components/Background";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Background>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-medium text-primary bg-primary/10 rounded-full">
            404 Error
          </div>
          <h1 className="text-4xl md:text-5xl font-medium mb-4">Page not found</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button 
            asChild
            className="inline-flex items-center gap-2 animate-slide-up"
          >
            <a href="/">
              <ArrowLeft className="h-4 w-4" />
              Return to Home
            </a>
          </Button>
        </div>
      </div>
    </Background>
  );
};

export default NotFound;
