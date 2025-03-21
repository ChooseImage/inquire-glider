import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { toast } from 'sonner';
import VideoPlayer from './VideoPlayer';
import { cn } from '@/lib/utils';

interface StoryPageProps {
  chapters?: {
    html: string;
    gliastar: string;  // This contains the video URL
    article: {
      title: string;
      content: string;
    };
  }[];
}

const StoryPage: React.FC<StoryPageProps> = ({ chapters = [] }) => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [localChapters, setLocalChapters] = useState(chapters);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  
  const chapterIndex = parseInt(chapterId || '1') - 1;
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterId]);
  
  useEffect(() => {
    if (chapters.length > 0) {
      setLocalChapters(chapters);
      // Store the latest chapters in localStorage
      localStorage.setItem('storyChapters', JSON.stringify(chapters));
    }
  }, [chapters]);
  
  useEffect(() => {
    if (chapters.length === 0) {
      try {
        const storedChapters = localStorage.getItem('storyChapters');
        if (storedChapters) {
          const parsedChapters = JSON.parse(storedChapters);
          console.log("Retrieved chapters from localStorage:", parsedChapters);
          
          // Process gliastar URLs to ensure they're properly formatted
          const processedChapters = parsedChapters.map((chapter: any) => {
            if (chapter.gliastar) {
              if (chapter.gliastar.endsWith('.webm')) {
                console.log(`Found .webm file for chapter: ${chapter.article?.title || 'Untitled'}`);
                // .webm URLs are used directly
              } else if (!chapter.gliastar.startsWith('https://')) {
                console.log(`Converting gliastar format for chapter: ${chapter.article?.title || 'Untitled'}`);
                // If it's not a URL, convert it
                chapter.gliastar = `https://static-gstudio.gliacloud.com/${chapter.gliastar}`;
              }
            }
            return chapter;
          });
          
          console.log("Processed chapters with updated gliastar URLs:", processedChapters);
          setLocalChapters(processedChapters);
        } else {
          console.warn("No chapters found in localStorage");
          toast.error("No story chapters found. Returning to home page.");
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error("Error retrieving chapters from localStorage:", error);
        toast.error("Error loading story. Returning to home page.");
        setTimeout(() => navigate('/'), 2000);
      }
    }
  }, [chapters, navigate]);
  
  const totalChapters = localChapters.length;
  
  useEffect(() => {
    console.log("StoryPage component with localChapters:", localChapters);
    console.log("Current chapter index:", chapterIndex);
    
    if (localChapters.length === 0) {
      // Already handled in the previous useEffect
    } else if (chapterIndex < 0 || chapterIndex >= localChapters.length) {
      toast.error(`Invalid chapter number. Valid range: 1-${localChapters.length}`);
      setTimeout(() => navigate('/story/1'), 2000);
    }
  }, [localChapters, chapterIndex, navigate]);
  
  const chapter = localChapters.length > 0 && chapterIndex >= 0 && chapterIndex < localChapters.length 
    ? localChapters[chapterIndex] 
    : {
        html: '',
        gliastar: '',
        article: { title: 'Chapter not found', content: 'Sorry, this chapter could not be loaded.' }
      };
  
  useEffect(() => {
    if (chapter && chapter.gliastar) {
      console.log("Updating current video URL from chapter:", chapter.gliastar);
      // Generate a unique key with timestamp to force VideoPlayer to reload
      const timestamp = new Date().getTime();
      setCurrentVideoUrl(`${chapter.gliastar}?t=${timestamp}`);
    } else {
      setCurrentVideoUrl('');
    }
  }, [chapter]);
  
  const prevChapter = chapterIndex > 0 ? `/story/${chapterIndex}` : null;
  const nextChapter = chapterIndex < totalChapters - 1 ? `/story/${chapterIndex + 2}` : null;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const formatContent = (content: string) => {
    if (!content) return '';
    
    const paragraphs = content.split('\n\n');
    if (paragraphs.length <= 1) {
      paragraphs.splice(0, 1, ...content.split('\n'));
    }
    
    return paragraphs.map((paragraph, index) => {
      const isRight = index % 2 === 1;
      
      return (
        <div 
          key={index} 
          className={cn(
            "mb-36 max-w-xl backdrop-blur-xl bg-black/20 p-6 rounded-lg",
            "border border-white/10",
            isRight ? "ml-auto" : "mr-auto"
          )}
        >
          <p className="leading-relaxed font-serif">{paragraph}</p>
        </div>
      );
    });
  };

  useEffect(() => {
    if (chapter && chapter.gliastar) {
      console.log("Current chapter gliastar URL:", chapter.gliastar);
    }
  }, [chapter]);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 w-full h-full z-0">
        {chapter.html ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-light animate-pulse">Loading chapter...</div>
              </div>
            )}
            <iframe 
              src={chapter.html} 
              className="w-full h-full border-none" 
              title={`Chapter ${chapterIndex + 1}`}
              onLoad={handleIframeLoad}
            />
          </>
        ) : (
          <div className="w-full h-full">
            <div className="w-full h-full">
              {/* Empty div for background */}
            </div>
          </div>
        )}
      </div>
      
      {currentVideoUrl && (
        <VideoPlayer key={currentVideoUrl} videoUrl={currentVideoUrl} />
      )}
      
      <div className="relative z-10 pt-8 pb-16 px-4 min-h-screen flex flex-col items-center">
        <header className="w-full max-w-3xl mx-auto flex justify-between items-center mb-12 px-4">
          <Link to="/">
            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/20 bg-black/30 hover:text-white">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          
          <div className="text-white text-sm font-medium px-3 py-1.5 rounded-full bg-black/30">
            Chapter {chapterIndex + 1} of {totalChapters}
          </div>
        </header>
        
        <article className="prose prose-lg prose-invert max-w-3xl w-full mx-auto px-6 py-8 rounded-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8 leading-tight">
            {chapter.article.title || "Chapter Title Not Available"}
          </h1>
          
          <div className="text-white/90 text-lg space-y-60 w-full">
            {formatContent(chapter.article.content)}
          </div>
        </article>
        
        <footer className="w-full max-w-3xl mx-auto flex justify-between items-center mt-12 px-4">
          {prevChapter ? (
            <Link to={prevChapter}>
              <Button variant="outline" size="sm" className="text-white border-white/20 bg-black/30 hover:bg-white/20 hover:text-white">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Chapter
              </Button>
            </Link>
          ) : (
            <div></div>
          )}
          
          {nextChapter ? (
            <Link to={nextChapter}>
              <Button variant="outline" size="sm" className="text-white border-white/20 bg-black/30 hover:bg-white/20 hover:text-white">
                Next Chapter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button variant="outline" size="sm" className="text-white border-white/20 bg-black/30 hover:bg-white/20 hover:text-white">
                Finish Story
                <Home className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </footer>
      </div>
    </div>
  );
};

export default StoryPage;
