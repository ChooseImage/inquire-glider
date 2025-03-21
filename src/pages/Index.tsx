import React, { useState, useEffect } from "react";
import ChatInput from "@/components/ChatInput";
import LoadingState from "@/components/LoadingState";
import StoryContainer from "@/components/StoryContainer";
import VideoPlayer from "@/components/VideoPlayer";
import { Story, StoryState } from "@/types/story";
import { tallestBuildingsStory } from "@/utils/dummyData";
import { toast } from "sonner";
import { streamConversation, invokeConversation } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, RefreshCw, Code, Settings, Book } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import BuildingsVisualization from "@/components/BuildingsVisualization";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import StreamDebugger from "@/components/StreamDebugger";

const API_CONFIG = {
  LOCAL_MODE: false,
  FALLBACK_TO_DUMMY: true,
  USE_CORS_PROXIES: true
};

const Index = () => {
  const [storyState, setStoryState] = useState<StoryState>('idle');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [hasValidThreeJsContent, setHasValidThreeJsContent] = useState(false);
  const [streamingContent, setStreamingContent] = useState<any[]>([]);
  const [showStreamDebug, setShowStreamDebug] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [storyChapters, setStoryChapters] = useState<any[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (storyChapters.length > 0) {
      localStorage.setItem('storyChapters', JSON.stringify(storyChapters));
      
      if (storyChapters[0]?.gliastar) {
        const gliastarUrl = storyChapters[0].gliastar;
        
        if (gliastarUrl.endsWith('.webm')) {
          setCurrentVideoUrl(gliastarUrl);
        } else if (!gliastarUrl.startsWith('https://')) {
          const formattedUrl = `https://static-gstudio.gliacloud.com/${gliastarUrl}`;
          setCurrentVideoUrl(formattedUrl);
        } else {
          setCurrentVideoUrl(gliastarUrl);
        }
      }
    }
  }, [storyChapters]);

  const logStreamContent = (eventType: string, data: any) => {
    if (data.content && Array.isArray(data.content)) {
      data.content.forEach((item: any) => {
        if (item.type === "result" && Array.isArray(item.scenes)) {
          setStoryChapters(item.scenes);
        }
      });
      
      if (data.content.length > 0 && Array.isArray(data.content[0].scenes)) {
        setStoryChapters(data.content[0].scenes);
      }
    }
    
    if (data.scenes && Array.isArray(data.scenes)) {
      setStoryChapters(data.scenes);
    }
    
    setStreamingContent(prev => {
      const timestamp = new Date().toISOString();
      const newItem = { 
        type: eventType, 
        data, 
        timestamp 
      };
      
      return [...prev, newItem];
    });
  };

  const handleStoryChaptersUpdated = (chapters: any[]) => {
    if (chapters && chapters.length > 0) {
      setStoryChapters(chapters);
      localStorage.setItem('storyChapters', JSON.stringify(chapters));
    }
  };

  const handleNavigateToStory = (chapterId: number) => {
    if (storyChapters.length > 0) {
      localStorage.setItem('storyChapters', JSON.stringify(storyChapters));
    }
    navigate(`/story/${chapterId}`, { state: { chapters: storyChapters } });
  };

  const handleNavigateToSketch = () => {
    navigate('/sketch');
  };

  useEffect(() => {
    if (!activeStory || storyState !== 'ready') {
      setHasValidThreeJsContent(false);
      return;
    }

    const hasThreeJs = activeStory.scenes.some(scene => 
      scene.data?.threejs_code || scene.threeJsCode
    );
    
    setHasValidThreeJsContent(hasThreeJs);
  }, [activeStory, storyState]);

  const handlePromptSubmit = async (prompt: string) => {
    setStoryState('loading');
    setApiError(null);
    setIsRetrying(false);
    toast.info("Generating your story...");
    setStreamingContent([]);
    setStoryChapters([]);
    
    try {
      toast.info("Starting stream...");
      const streamResponse = await streamConversation(prompt, (eventType, data) => {
        logStreamContent(eventType, data);
        
        if (data.content && Array.isArray(data.content)) {
          data.content.forEach((item: any) => {
            if (item.type === "result" && Array.isArray(item.scenes)) {
              setStoryChapters(item.scenes);
            }
          });
          
          if (data.content.length > 0 && Array.isArray(data.content[0].scenes)) {
            setStoryChapters(data.content[0].scenes);
          }
        }
        
        if (data.scenes && Array.isArray(data.scenes)) {
          setStoryChapters(data.scenes);
        }
      });
      
      if (!streamResponse.success) {
        if (streamResponse.error) {
          setApiError(streamResponse.error);
          toast.error(streamResponse.error, {
            duration: 4000,
          });
        }
      }
      
      const story = await invokeConversation(prompt);
      
      setActiveStory(story);
      setStoryState('ready');
      setHasValidThreeJsContent(true);
      toast.success("Your story is ready!");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setApiError(errorMessage);
      toast.error("Using fallback dummy data");
      
      setActiveStory({
        ...tallestBuildingsStory,
        originalPrompt: prompt,
        title: prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt
      });
      
      setStoryState('ready');
      setHasValidThreeJsContent(true);
    }
  };

  const handleRetry = async () => {
    if (!activeStory?.originalPrompt) return;
    
    setIsRetrying(true);
    setApiError(null);
    toast.info("Retrying with different proxy...");
    
    try {
      await handlePromptSubmit(activeStory.originalPrompt);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleReset = () => {
    setStoryState('idle');
    setActiveStory(null);
    setHasValidThreeJsContent(false);
    setStreamingContent([]);
    setApiError(null);
    setIsRetrying(false);
  };

  const toggleStreamDebug = () => {
    setShowStreamDebug(prev => !prev);
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId("https://www.youtube.com/watch?v=7wIIzk_aUsg") || "";

  const videoUrl = "https://static-gstudio.gliacloud.com/10903/files/a86e423ead118924eba4577a3505f818aff8c413.mp4";

  return (
    <div className="min-h-screen w-full bg-background relative">
      {storyState === 'ready' && <VideoPlayer videoUrl={currentVideoUrl} />}

      <StreamDebugger 
        streamingContent={streamingContent} 
        visible={showStreamDebug} 
      />

      {storyChapters.length > 0 && storyState === 'ready' && (
        <div className="fixed top-20 left-0 right-0 z-50 flex justify-center">
          <div className="bg-black/80 backdrop-blur-md p-6 rounded-lg max-w-2xl">
            <h2 className="text-2xl font-semibold text-white mb-4">Your Storybook</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {storyChapters.map((chapter, index) => (
                <Button 
                  key={index} 
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white h-auto flex flex-col items-center p-4"
                  onClick={() => handleNavigateToStory(index + 1)}
                >
                  <Book className="h-8 w-8 mb-2 text-primary" />
                  <span className="text-sm font-medium">{chapter.article.title || `Chapter ${index + 1}`}</span>
                  <span className="mt-1 text-xs text-white/70">Chapter {index + 1}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {apiError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center max-w-md">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">API Error</p>
            <p className="text-sm">{apiError}</p>
            <div className="flex space-x-2 mt-2">
              {apiError.includes("CORS") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="bg-white/20 hover:bg-white/40 border-white/30"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Try Different Proxy
                    </>
                  )}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleStreamDebug}
                className="bg-white/20 hover:bg-white/40 border-white/30"
              >
                <Code className="h-3 w-3 mr-2" />
                Debug
              </Button>
            </div>
          </div>
          <button 
            onClick={() => setApiError(null)} 
            className="ml-2 text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      <div className="fixed bottom-24 right-4 z-50 flex flex-col space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleStreamDebug}
          className="bg-black/70 text-white border-gray-700 hover:bg-black/90"
        >
          <Code className="h-4 w-4 mr-2" />
          {showStreamDebug ? "Hide" : "Show"} Stream Data
        </Button>
      </div>

      {showStreamDebug && (
        <div className="fixed top-4 right-4 w-80 max-h-[500px] overflow-auto bg-black/80 text-white p-4 rounded-lg z-50 font-mono text-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold">API Debug Panel</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowStreamDebug(false)}
              className="h-6 text-xs text-white/70 hover:text-white hover:bg-white/10"
            >
              Hide
            </Button>
          </div>
          <div className="mb-3 p-2 bg-blue-500/20 rounded text-blue-200 text-xs">
            <p><strong>API Configuration:</strong></p>
            <p>LOCAL_MODE: {API_CONFIG.LOCAL_MODE ? 'Enabled' : 'Disabled'}</p>
            <p>FALLBACK_TO_DUMMY: {API_CONFIG.FALLBACK_TO_DUMMY ? 'Enabled' : 'Disabled'}</p>
            <p>USE_CORS_PROXIES: {API_CONFIG.USE_CORS_PROXIES ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div className="overflow-y-auto max-h-[450px]">
            {streamingContent.length === 0 ? (
              <div className="text-gray-400 italic">No stream data received yet</div>
            ) : (
              streamingContent.map((item, index) => (
                <div key={index} className="mb-2 pb-2 border-b border-white/20">
                  <div className="text-xs text-green-400 mb-1">
                    {item.type} ({new Date(item.timestamp).toLocaleTimeString()}):
                  </div>
                  <pre className="whitespace-pre-wrap text-xs overflow-hidden text-ellipsis">
                    {JSON.stringify(item.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {storyState === 'ready' && hasValidThreeJsContent && (
        <div className="relative w-full h-screen">
          <BuildingsVisualization story={activeStory} isActive={storyState === 'ready'} />
          
          <div className="absolute top-0 left-0 w-full p-4 bg-black/50 text-white z-50 pointer-events-auto">
            <h2 className="text-lg font-bold">World's Tallest Buildings Visualization</h2>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNavigateToSketch}
              className="mt-2 bg-white/40 hover:bg-white/60 text-white border-white/40 font-semibold"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Screen Three.js Sketch
            </Button>
          </div>
          
          <div className="relative mt-screen">
            <div className="h-[300vh] bg-gradient-to-b from-transparent to-background pt-[100vh]">
              <div className="container mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold mb-6">Scroll to Explore the Buildings</h2>
                <p className="text-lg mb-8">As you scroll down, watch how the camera flies around the world's tallest buildings.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-3">About This Visualization</h3>
                    <p>This interactive 3D visualization shows the top 10 tallest buildings in the world. 
                    Scroll to change the camera angle and get different perspectives.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-3">Architectural Wonders</h3>
                    <p>These incredible structures represent some of humanity's greatest architectural and engineering achievements.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                  {tallestBuildingsStory.scenes.slice(2, 8).map((scene, index) => (
                    scene.data && (
                      <div key={scene.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                        <h3 className="text-xl font-semibold mb-3">{scene.title}</h3>
                        <p className="mb-3">{scene.data.content_copy ? scene.data.content_copy.substring(0, 150) + '...' : scene.description}</p>
                        {scene.data.height && (
                          <div className="mt-2 text-sm">
                            <p>Height: {scene.data.height}m</p>
                            <p>Completed: {scene.data.completionYear}</p>
                            <p>Location: {scene.data.location}</p>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
                
                <div className="h-[50vh] flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-lg p-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Keep Scrolling for More</h2>
                    <p className="text-xl">The visualization responds to your scroll position</p>
                  </div>
                </div>
                
                <div className="h-[30vh]"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {storyState === 'idle' && (
        <div className="absolute top-0 left-0 w-full min-h-screen flex flex-col justify-center items-center p-8 z-20">
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in glass-panel p-8 rounded-lg">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Interactive Storybook Creator
            </h1>
            
            {tallestBuildingsStory.scenes[0]?.data?.content_copy && (
              <p className="text-lg text-muted-foreground">
                {tallestBuildingsStory.scenes[0].data.content_copy}
              </p>
            )}
            
            <div className="text-muted-foreground">
              <p>Try asking about:</p>
              <ul className="mt-2 inline-flex flex-col gap-1">
                <li>"What are the tallest buildings in the world?"</li>
                <li>"How do volcanoes work?"</li>
                <li>"Tell me about the solar system"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <LoadingState 
        isLoading={storyState === 'loading'} 
        streamingContent={streamingContent}
        onStoryChaptersUpdated={handleStoryChaptersUpdated}
      />
      
      <StoryContainer 
        story={activeStory} 
        isVisible={storyState === 'ready'}
        onReset={handleReset}
        storyChapters={storyChapters}
      />
      
      <ChatInput 
        onSubmit={handlePromptSubmit} 
        isLoading={storyState === 'loading'} 
      />
    </div>
  );
};

export default Index;
