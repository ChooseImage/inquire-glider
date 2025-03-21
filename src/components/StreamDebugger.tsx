
import React, { useEffect, useState } from 'react';
import { ScrollArea } from './ui/scroll-area';

interface StreamMessage {
  id: string;
  content: string;
  type: string;
  timestamp: string;
}

interface StreamDebuggerProps {
  streamingContent: any[];
  visible: boolean;
}

const StreamDebugger: React.FC<StreamDebuggerProps> = ({ streamingContent, visible }) => {
  const [messages, setMessages] = useState<StreamMessage[]>([]);

  // Process streaming content and merge messages by ID
  useEffect(() => {
    if (streamingContent.length === 0) {
      setMessages([]);
      return;
    }

    // Process latest streaming content item
    const processLatestContent = () => {
      const latestItem = streamingContent[streamingContent.length - 1];
      if (!latestItem || !latestItem.data) return;

      // Extract content from data structure
      if (latestItem.data.content && Array.isArray(latestItem.data.content)) {
        latestItem.data.content.forEach((contentItem: any) => {
          if (contentItem.id && contentItem.content) {
            // Check if we already have this message ID
            setMessages(prevMessages => {
              const existingIndex = prevMessages.findIndex(m => m.id === contentItem.id);
              
              if (existingIndex === -1) {
                // It's a new message
                return [
                  ...prevMessages,
                  {
                    id: contentItem.id,
                    content: contentItem.content,
                    type: contentItem.type || latestItem.type || 'unknown',
                    timestamp: latestItem.timestamp
                  }
                ];
              } else {
                // Update existing message
                const updatedMessages = [...prevMessages];
                updatedMessages[existingIndex] = {
                  ...updatedMessages[existingIndex],
                  content: contentItem.content,
                  timestamp: latestItem.timestamp
                };
                return updatedMessages;
              }
            });
          }
        });
      }
    };

    processLatestContent();
  }, [streamingContent]);

  // Print all streaming content to console for easy debugging
  useEffect(() => {
    if (streamingContent.length > 0) {
      console.log('Current streaming content:', streamingContent);
    }
  }, [streamingContent]);

  if (!visible) return null;

  return (
    <div className="fixed top-16 right-4 w-96 max-h-[70vh] bg-black/80 text-white p-4 rounded-lg z-50 font-mono text-xs shadow-xl border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Stream Content</h3>
      </div>
      
      <ScrollArea className="h-[60vh]">
        {messages.length === 0 ? (
          <div className="text-gray-400 italic">No stream data received yet</div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="mb-4 pb-2 border-b border-white/20">
                <div className="text-xs text-green-400 mb-1 flex justify-between">
                  <span>{message.type || 'message'}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-xs overflow-hidden bg-black/50 p-2 rounded">
                  {message.content}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-xs font-bold mb-2">Raw Stream Events:</h4>
          {streamingContent.map((item, index) => (
            <div key={index} className="mb-4 pb-2 border-b border-white/20">
              <div className="text-xs text-blue-400 mb-1 flex justify-between">
                <span>{item.type || 'data'}</span>
                <span className="text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-xs overflow-hidden bg-black/50 p-2 rounded">
                {typeof item.data === 'object' 
                  ? JSON.stringify(item.data, null, 2) 
                  : item.data}
              </pre>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StreamDebugger;
