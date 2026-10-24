export type SectionBounds = { id: string; top: number; bottom: number };

function sectionAt(y: number, sections: SectionBounds[]): string | undefined {
  return sections.find((item) => item.top <= y && item.bottom > y)?.id;
}

export function canOrbitAt(y: number, sections: SectionBounds[]): boolean {
  return sectionAt(y, sections) === 'sec-intro';
}

export function carIsVisibleAt(y: number, sections: SectionBounds[]): boolean {
  const section = sectionAt(y, sections);
  return section === 'sec-intro' || section === 'sec-contact';
}

export function hasFullIntroView(height: number, sections: SectionBounds[]): boolean {
  return (
    height > 0 &&
    sections.some(
      ({ id, top, bottom }) =>
        id === 'sec-intro' && Math.round(top) <= 0 && Math.round(bottom) >= height,
    )
  );
}

export function pageSectionBounds(): SectionBounds[] {
  return ['sec-intro', 'sec-experience', 'sec-work', 'sec-about', 'sec-contact'].flatMap((id) => {
    const element = document.getElementById(id);
    if (!element) return [];
    const { top, bottom } = element.getBoundingClientRect();
    return [{ id, top, bottom }];
  });
}

export function contactIsVisible(height: number, sections: SectionBounds[]): boolean {
  return sections.some(({ id, top, bottom }) => id === 'sec-contact' && top < height && bottom > 0);
}
