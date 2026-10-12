export type SectionBounds = { id: string; top: number; bottom: number };

export function canOrbitAt(y: number, sections: SectionBounds[]): boolean {
  const section = sections.find((item) => item.top <= y && item.bottom > y);
  return section?.id === 'sec-intro' || section?.id === 'sec-contact';
}

export function pageSectionBounds(): SectionBounds[] {
  return ['sec-intro', 'sec-experience', 'sec-work', 'sec-about', 'sec-contact'].flatMap((id) => {
    const element = document.getElementById(id);
    if (!element) return [];
    const { top, bottom } = element.getBoundingClientRect();
    return [{ id, top, bottom }];
  });
}
