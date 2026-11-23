import { storyHref } from '../creative/storyRoutes';
import { ProjectScene, ScrollScenes } from './ProjectScene';
import './iodine-presentation.css';

const approvals = [
  {
    image: 'iodine-inside',
    alt: 'Iodine reuses an approval for ls src/components because it is within the approved folder.',
  },
  {
    image: 'iodine-outside',
    alt: 'Iodine requests a fresh approval for ls docs because it is outside the approved folder.',
  },
] as const;

export function IodinePresentation() {
  return (
    <ProjectScene
      id="project-iodine"
      theme="iodine"
      title="iodine"
      links={
        <a href={storyHref('iodine')} aria-label="Read the iodine case study">
          Case study <span aria-hidden="true">↗</span>
        </a>
      }
    >
      <ScrollScenes frames={approvals} />
    </ProjectScene>
  );
}
