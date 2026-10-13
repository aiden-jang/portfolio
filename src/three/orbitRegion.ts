export type SectionBounds = { id: string; top: number; bottom: number };

export function canOrbitAt(y: number, sections: SectionBounds[]): boolean {
  const section = sections.find((item) => item.top <= y && item.bottom > y);
  return section?.id === 'sec-intro' || section?.id === 'sec-contact';
}

export function hasFullCarView(height: number, sections: SectionBounds[]): boolean {
  return (
    height > 0 &&
    sections.some(
      ({ id, top, bottom }) =>
        (id === 'sec-intro' || id === 'sec-contact') &&
        Math.round(top) <= 0 &&
        Math.round(bottom) >= height,
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
