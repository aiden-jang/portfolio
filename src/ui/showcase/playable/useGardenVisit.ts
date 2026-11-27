import { useEffect, useMemo, useState } from 'react';
import { gardenFlowers, type PlantedFlower } from './gardenFlowers';
import { usePlantedGarden } from './usePlantedGarden';
import { nextWorkState } from '../../workIndexNavigation';

function readVisit() {
  const [, place, name] = /^#(garden|sill)\/([a-z]+)$/.exec(location.hash) ?? [];
  const index = gardenFlowers.findIndex((flower) => flower.name.toLowerCase() === name);
  return index === -1 ? null : { place, index };
}

function address(place: 'garden' | 'sill', index: number) {
  return '#' + place + '/' + gardenFlowers[index].name.toLowerCase();
}

export function useGardenVisit() {
  const { plants, plant } = usePlantedGarden();
  const [visit, setVisit] = useState(readVisit);
  const [selected, select] = useState(visit?.index ?? plants.at(-1)?.index ?? 1);
  const [carried, carry] = useState<number | null>(visit?.place === 'sill' ? visit.index : null);
  const sill = carried ?? plants.at(-1)?.index;
  const flower = useMemo(() => {
    if (sill === undefined) return null;
    return (
      plants.find((item) => item.index === sill) ?? {
        index: sill,
        note: gardenFlowers[sill].phrase,
        example: true,
      }
    );
  }, [plants, sill]);

  function sync() {
    const next = readVisit();
    setVisit((previous) =>
      previous?.place === next?.place && previous?.index === next?.index ? previous : next,
    );
    if (next) select(next.index);
    if (next?.place === 'sill') carry(next.index);
  }

  useEffect(() => {
    const restorePage = (event: PageTransitionEvent) => {
      if (event.persisted) sync();
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    window.addEventListener('pageshow', restorePage);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('pageshow', restorePage);
    };
  }, []);

  useEffect(() => {
    if (visit?.place !== 'sill') return;
    const frame = requestAnimationFrame(() => {
      const room = document.getElementById('project-mrrp');
      room?.scrollIntoView({ block: 'start', behavior: 'instant' });
      room?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [visit]);

  function open(index = selected, fromPreview = true) {
    if (fromPreview) history.replaceState({ ...history.state, gardenReturnY: window.scrollY }, '');
    history.pushState({ ...nextWorkState(), gardenOpener: true }, '', address('garden', index));
    sync();
  }

  function backToGarden() {
    if (!flower) return;
    if (readVisit()?.place === 'sill' && history.state?.gardenOpener) history.back();
    else open(flower.index, false);
  }

  return {
    selected,
    plants,
    flower,
    open,
    backToGarden,
    showGarden: visit?.place === 'garden',
    choose(index: number) {
      select(index);
      if (readVisit()?.place === 'garden') {
        history.replaceState(history.state, '', address('garden', index));
      }
    },
    plant(next: PlantedFlower) {
      plant(next);
      carry(null);
    },
    visitSill() {
      history.pushState({ ...nextWorkState(), gardenOpener: true }, '', address('sill', selected));
      sync();
    },
    close() {
      if (history.state?.gardenOpener) {
        history.back();
      } else {
        history.replaceState(history.state, '', '#project-bloomnote');
        sync();
        requestAnimationFrame(() => {
          document
            .getElementById('project-bloomnote')
            ?.scrollIntoView({ block: 'start', behavior: 'instant' });
        });
      }
    },
  };
}
