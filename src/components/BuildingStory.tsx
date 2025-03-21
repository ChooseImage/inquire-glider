
import React, { useEffect, useRef, useState } from 'react';
import { Story, StoryScene } from '@/types/story';
import * as THREE from 'three';
import { cn } from '@/lib/utils';
import { ChevronDown, RefreshCw, MessageSquare, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface BuildingStoryProps {
  story: Story;
  onReset: () => void;
  storyChapters?: any[];
}

const BuildingStory: React.FC<BuildingStoryProps> = ({ story, onReset, storyChapters = [] }) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [scenes, setScenes] = useState<Map<string, any>>(new Map());
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();

  // Initialize refs
  useEffect(() => {
    sectionRefs.current = story.scenes.map(() => null);
    canvasRefs.current = story.scenes.map(() => null);
  }, [story.scenes.length]);

  // Setup IntersectionObserver for scroll-based navigation
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setActiveSceneIndex(index);
          }
        });
      },
      { threshold: 0.6 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [story.scenes]);

  // Initialize Three.js scenes
  useEffect(() => {
    story.scenes.forEach((storyScene, index) => {
      // Check if scene has threejs_code in data or direct threeJsCode property
      const threeJsCode = storyScene.data?.threejs_code || storyScene.threeJsCode;
      if (!threeJsCode || !canvasRefs.current[index]) return;

      const canvas = canvasRefs.current[index];
      if (!canvas) return;

      // Create Three.js renderer, scene, and camera
      const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true
      });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // These variables are expected to be used in the injected code
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75, 
        canvas.clientWidth / canvas.clientHeight, 
        0.1, 
        1000
      );

      // Create a clean context for eval (we use Function constructor for better isolation)
      try {
        const setupFn = new Function(
          'THREE', 
          'scene', 
          'camera', 
          'renderer', 
          'canvas',
          threeJsCode
        );
        
        setupFn(THREE, scene, camera, renderer, canvas);
        
        // Store the Three.js objects
        setScenes(prev => new Map(prev).set(storyScene.id, {
          renderer,
          scene,
          camera
        }));
      } catch (error) {
        console.error(`Error setting up Three.js scene for ${storyScene.id}:`, error);
      }
    });

    // Cleanup
    return () => {
      scenes.forEach(({ renderer }) => {
        renderer.dispose();
      });
    };
  }, [story.scenes]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      canvasRefs.current.forEach((canvas, index) => {
        if (!canvas) return;
        
        const sceneObj = scenes.get(story.scenes[index].id);
        if (!sceneObj) return;
        
        const { renderer, camera } = sceneObj;
        
        // Update camera aspect ratio
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        
        // Update renderer size
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scenes, story.scenes]);

  // Handle button clicks
  const handleButtonClick = (action: string) => {
    switch (action) {
      case 'restartTour':
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'newPrompt':
        onReset();
        break;
      default:
        console.log(`Action not implemented: ${action}`);
    }
  };

  // Navigate to story chapter
  const handleNavigateToStory = (chapterId: number) => {
    navigate(`/story/${chapterId}`, { state: { chapters: storyChapters } });
  };

  // Scroll to next section
  const scrollToNextSection = () => {
    const nextIndex = Math.min(activeSceneIndex + 1, story.scenes.length - 1);
    sectionRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Story hero section */}
      <section 
        ref={el => sectionRefs.current[0] = el}
        data-index={0}
        className="min-h-screen flex flex-col justify-center items-center p-8 relative"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            Interactive Storybook
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            {story.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Based on your question: <span className="italic">"{story.originalPrompt}"</span>
          </p>
          
          {/* Display content_copy if available in the first scene */}
          {story.scenes[0].data?.content_copy && (
            <div className="mt-6 text-lg text-muted-foreground">
              {story.scenes[0].data.content_copy}
            </div>
          )}
        </div>

        {/* Display story chapters if available */}
        {storyChapters && storyChapters.length > 0 && (
          <div className="mt-12 w-full max-w-4xl">
            <h2 className="text-2xl font-semibold mb-6 text-center">Your Storybook Chapters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {storyChapters.map((chapter, index) => (
                <Button 
                  key={index} 
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 h-auto flex flex-col items-center p-6"
                  onClick={() => handleNavigateToStory(index + 1)}
                >
                  <Book className="h-10 w-10 mb-3 text-primary" />
                  <span className="text-base font-medium text-center">{chapter.article.title}</span>
                  <span className="mt-2 text-sm text-muted-foreground">Chapter {index + 1}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* First scene canvas */}
        {(story.scenes[0].data?.threejs_code || story.scenes[0].threeJsCode) && (
          <div className="w-full max-w-4xl h-64 md:h-96 mt-12 relative overflow-hidden rounded-xl">
            <canvas
              ref={el => canvasRefs.current[0] = el}
              className="w-full h-full"
            />
          </div>
        )}

        <button
          onClick={scrollToNextSection}
          className="absolute bottom-8 animate-bounce hover:animate-none hover:bg-muted/50 transition-colors rounded-full p-2"
          aria-label="Scroll down"
        >
          <ChevronDown size={24} />
        </button>
      </section>

      {/* Story content sections */}
      {story.scenes.slice(1).map((storyScene, idx) => {
        const index = idx + 1;
        return (
          <section
            key={storyScene.id}
            ref={el => sectionRefs.current[index] = el}
            data-index={index}
            className={cn(
              "min-h-screen flex flex-col justify-center items-center p-8",
              "scroll-mt-8"
            )}
          >
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left side - 3D or Image */}
              <div className="order-2 md:order-1">
                {(storyScene.data?.threejs_code || storyScene.threeJsCode) ? (
                  <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-muted/20">
                    <canvas
                      ref={el => canvasRefs.current[index] = el}
                      className="w-full h-full"
                    />
                  </div>
                ) : storyScene.data?.imageUrl ? (
                  <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-muted/20">
                    <img
                      src={storyScene.data.imageUrl}
                      alt={storyScene.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full flex items-center justify-center bg-muted/20 rounded-xl">
                    <div className="text-muted-foreground">No visual content</div>
                  </div>
                )}
              </div>

              {/* Right side - Content */}
              <div className="order-1 md:order-2 space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">
                  {storyScene.title}
                </h2>
                
                {/* Display content_copy from data if available, otherwise use description */}
                <p className="text-lg text-muted-foreground">
                  {storyScene.data?.content_copy || storyScene.description}
                </p>

                {/* Display building data if available */}
                {storyScene.data && 'height' in storyScene.data && (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Height</div>
                      <div className="text-xl font-semibold">{storyScene.data.height} meters</div>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Floors</div>
                      <div className="text-xl font-semibold">{storyScene.data.floors}</div>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Completed</div>
                      <div className="text-xl font-semibold">{storyScene.data.completionYear}</div>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="text-xl font-semibold">{storyScene.data.location}</div>
                    </div>
                  </div>
                )}

                {/* Interactive buttons */}
                {storyScene.interactiveElements?.filter(el => el.type === 'button').length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-6">
                    {storyScene.interactiveElements
                      .filter(el => el.type === 'button')
                      .map(button => (
                        <button
                          key={button.id}
                          onClick={() => handleButtonClick(button.action)}
                          className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                          {button.label}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* Floating controls */}
      <div className="fixed bottom-8 left-8 z-40 flex space-x-2">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-lg hover:bg-muted/20 transition-colors"
          aria-label="Back to top"
        >
          <RefreshCw size={18} />
        </button>
        <button
          onClick={onReset}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-lg hover:bg-muted/20 transition-colors"
          aria-label="Ask a new question"
        >
          <MessageSquare size={18} />
        </button>
      </div>
    </div>
  );
};

export default BuildingStory;
