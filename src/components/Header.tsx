
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 animate-fade-in">
      <div className="container flex flex-col items-center justify-center">
        <div className="inline-block px-3 py-1 mb-2 text-xs font-medium text-primary bg-primary/10 rounded-full">
          AI Assistant
        </div>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-center mb-1">
          Ask me anything
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Get instant answers with our intelligent AI assistant
        </p>
      </div>
    </header>
  );
};

export default Header;
