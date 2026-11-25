import { createContext, type MouseEvent } from 'react';
import type { StoryId } from './storyRoutes';

export const batchingStory = 'ad-slot-details-120-1-api-call';

export const OpenEvidence = createContext<
  ((event: MouseEvent<HTMLAnchorElement>, id: StoryId) => boolean) | null
>(null);
