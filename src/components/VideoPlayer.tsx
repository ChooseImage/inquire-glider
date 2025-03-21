
import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [formattedUrl, setFormattedUrl] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastVideoUrlRef = useRef<string>('');

  // Update when the component receives a new videoUrl prop
  useEffect(() => {
    // Check if this is actually a new URL, not just a rerender
    if (videoUrl !== lastVideoUrlRef.current) {
      lastVideoUrlRef.current = videoUrl;
      
      // Reset closed state when new URL is provided
      if (videoUrl && isClosed) {
        setIsClosed(false);
      }
      
      // Process the URL
      if (videoUrl) {
        // Remove any query parameters (like timestamps) that we may have added
        const baseUrl = videoUrl.split('?')[0];
        
        // Ensure URL is properly formatted
        if (baseUrl.endsWith('.webm')) {
          setFormattedUrl(baseUrl);
        } else if (!baseUrl.startsWith('https://')) {
          // If it's not a URL, assume it needs to be converted to one
          setFormattedUrl(`https://static-gstudio.gliacloud.com/${baseUrl}`);
        } else {
          setFormattedUrl(baseUrl);
        }
      } else {
        setFormattedUrl('');
      }
    }
  }, [videoUrl, isClosed]);

  // Reset video and ensure autoplay when URL changes
  useEffect(() => {
    // Reset the video element with the new source
    if (videoRef.current && formattedUrl) {
      videoRef.current.load();
      
      // Ensure video plays after loading
      const playPromise = videoRef.current.play();
      
      // Handle potential play() rejection (browsers may block autoplay)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Auto-play was prevented
          // Show a UI element to let the user manually start playback
        });
      }
    }
  }, [formattedUrl]);

  if (isClosed || !formattedUrl) return null;

  return (
    <div 
      className={`fixed bottom-8 left-8 z-40 glass-panel rounded-lg shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
        isMinimized ? 'w-64 h-36' : 'w-80 h-48 sm:w-96 sm:h-56'
      }`}
    >
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button 
          onClick={() => setIsMinimized(!isMinimized)} 
          className="bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
          aria-label={isMinimized ? "Maximize" : "Minimize"}
        >
          {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
        <button 
          onClick={() => setIsClosed(true)} 
          className="bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
      
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={formattedUrl}
        autoPlay
        loop
        playsInline
      />
    </div>
  );
};

export default VideoPlayer;
