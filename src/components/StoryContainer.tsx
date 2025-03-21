
import React, { useEffect, useState, useRef } from 'react';
import { Story } from '@/types/story';
import { cn } from '@/lib/utils';
import BuildingStory from './BuildingStory';

interface StoryContainerProps {
  story: Story | null;
  isVisible: boolean;
  onReset: () => void;
  storyChapters?: any[];
}

const StoryContainer: React.FC<StoryContainerProps> = ({
  story,
  isVisible,
  onReset,
  storyChapters = []
}) => {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && story) {
      // Small delay to allow animations to play
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [isVisible, story]);

  // Choose the right story component based on story ID or tags
  const renderStoryContent = () => {
    if (!story) return null;
    
    // For now, we only have the buildings example
    return <BuildingStory story={story} onReset={onReset} storyChapters={storyChapters} />;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-30 overflow-y-auto',
        'transition-opacity duration-500 ease-in-out',
        isVisible && isReady ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      {renderStoryContent()}
    </div>
  );
};

export default StoryContainer;
