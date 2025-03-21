
export interface Story {
  id: string;
  title: string;
  originalPrompt: string;
  scenes: Scene[];
  metadata: StoryMetadata;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  interactiveElements?: InteractiveElement[];
}

export interface InteractiveElement {
  type: string;
  id: string;
  label: string;
  action: string;
}

export interface StoryMetadata {
  createdAt: string;
  tags: string[];
  thread_id: string;
  error?: string;
}
