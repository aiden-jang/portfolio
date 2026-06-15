import { useState } from 'react';
import { AboutSection } from './sections/About';
import { ContactSection } from './sections/Contact';
import { IntroSection } from './sections/Intro';
import { ResumeSection } from './sections/Resume';
import { WorkSection } from './sections/Work';
import { WorkModal, type WorkDetail } from './WorkModal';

/** Top-level page layout: the five scroll sections, plus the WorkModal that
 *  any WorkRow can open. Section content + styling lives in `./sections/*`. */
export function Sections() {
  const [activeWork, setActiveWork] = useState<WorkDetail | null>(null);
  return (
    <main id="scroll" tabIndex={-1} className="relative z-10 outline-none">
      <IntroSection />
      <WorkSection onOpen={setActiveWork} />
      <AboutSection />
      <ResumeSection />
      <ContactSection />
      <WorkModal item={activeWork} onClose={() => setActiveWork(null)} />
    </main>
  );
}
