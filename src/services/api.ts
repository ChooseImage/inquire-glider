interface StreamData {
  contents: Array<{
    type: string;
    text?: string;
    items?: any[];
  }>;
}

export async function streamQuestion(
  question: string,
  onAiUpdate: (text: string) => void,
  onResultUpdate: (result: any) => void
): Promise<void> {
  try {
    const response = await fetch('https://v0-0-43b18---genv-opengpts-al23s7k26q-de.a.run.app/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: question }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Cannot read response stream');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullAiResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // Decode the chunk and add it to our buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete JSON objects from the buffer
      let startIdx = 0;
      let endIdx;
      
      while ((endIdx = buffer.indexOf('}\n', startIdx)) !== -1) {
        const jsonStr = buffer.substring(startIdx, endIdx + 1);
        startIdx = endIdx + 2; // Move past the current JSON object
        
        try {
          const data: StreamData = JSON.parse(jsonStr);
          
          if (data.contents) {
            data.contents.forEach(content => {
              if (content.type === 'ai' && content.text) {
                fullAiResponse = content.text;
                onAiUpdate(fullAiResponse);
                console.log('AI Update:', content.text);
              } else if (content.type === 'result') {
                onResultUpdate(content);
                console.log('Result:', content);
              }
            });
          }
        } catch (error) {
          console.error('Error parsing JSON from stream:', error);
        }
      }
      
      // Keep any remaining incomplete data in the buffer
      buffer = buffer.substring(startIdx);
    }
    
    // Process any remaining data in buffer
    if (buffer.trim()) {
      try {
        const data: StreamData = JSON.parse(buffer);
        
        if (data.contents) {
          data.contents.forEach(content => {
            if (content.type === 'ai' && content.text) {
              fullAiResponse = content.text;
              onAiUpdate(fullAiResponse);
              console.log('AI Update:', content.text);
            } else if (content.type === 'result') {
              onResultUpdate(content);
              console.log('Result:', content);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing JSON from remaining buffer:', error);
      }
    }
  } catch (error) {
    console.error('Error streaming question:', error);
    throw error;
  }
}
