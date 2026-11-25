import { createContext, type MouseEvent } from 'react';
import type { StoryId } from './storyRoutes';

export type EvidenceFrame = {
  image: string;
  place: string;
  source: HTMLElement;
};

export type OpenEvidenceLink = (
  event: MouseEvent<HTMLAnchorElement>,
  id: StoryId,
  capture?: () => EvidenceFrame | undefined,
) => boolean;

export const batchingStory = 'ad-slot-details-120-1-api-call';

export const OpenEvidence = createContext<OpenEvidenceLink | null>(null);
