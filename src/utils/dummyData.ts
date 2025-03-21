
import { Story } from '@/types/story';

export const tallestBuildingsStory: Story = {
  id: 'buildings-story-1',
  title: 'The World\'s Tallest Buildings',
  originalPrompt: 'Tell me about the world\'s tallest buildings',
  scenes: [
    {
      id: 'scene-1',
      title: 'Introduction',
      description: 'In the race to touch the sky, humans have constructed increasingly taller structures throughout history. These architectural marvels represent both technological achievement and cultural ambition.'
    },
    {
      id: 'scene-2',
      title: 'Burj Khalifa',
      description: 'Standing at 828 meters (2,717 feet), the Burj Khalifa in Dubai has been the world\'s tallest building since its completion in 2010. Its design was inspired by the Hymenocallis flower and follows Islamic architecture principles.'
    },
    {
      id: 'scene-3',
      title: 'Merdeka 118',
      description: 'Completed in 2022, the Merdeka 118 in Kuala Lumpur, Malaysia reaches 678.9 meters (2,227 feet) and is currently the second-tallest building in the world.'
    },
    {
      id: 'scene-4',
      title: 'Shanghai Tower',
      description: 'The Shanghai Tower twists approximately one degree per floor to reduce wind loads, standing 632 meters (2,073 feet) tall as China\'s tallest building and the third tallest in the world.'
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      description: 'As technology advances, we can expect even taller skyscrapers to emerge. Future buildings may incorporate new materials, sustainable design principles, and innovative architectural approaches to continue pushing the boundaries of what\'s possible.',
      interactiveElements: [
        {
          type: 'button',
          id: 'restart-tour',
          label: 'Restart Tour',
          action: 'restartTour'
        },
        {
          type: 'button',
          id: 'new-prompt',
          label: 'Ask a New Question',
          action: 'newPrompt'
        }
      ]
    }
  ],
  metadata: {
    createdAt: new Date().toISOString(),
    tags: ['architecture', 'skyscrapers', 'buildings', 'world records'],
    thread_id: 'dummy-thread-123'
  }
};
