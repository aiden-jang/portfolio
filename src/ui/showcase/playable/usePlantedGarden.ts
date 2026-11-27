import { useEffect, useState } from 'react';
import { gardenFlowers, type PlantedFlower } from './gardenFlowers';

const key = 'bloomnote:portfolio-garden:1';

function readGarden(): PlantedFlower[] {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(key) ?? '[]');
    if (!Array.isArray(saved)) return [];
    return saved
      .filter(
        (plant): plant is PlantedFlower =>
          plant &&
          Number.isInteger(plant.index) &&
          plant.index >= 0 &&
          plant.index < gardenFlowers.length &&
          typeof plant.note === 'string' &&
          plant.note.length <= 105 &&
          plant.note.trim().length > 0,
      )
      .slice(-gardenFlowers.length);
  } catch {
    return [];
  }
}

export function usePlantedGarden() {
  const [plants, setPlants] = useState(readGarden);
  useEffect(() => {
    if (!plants.length) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(plants));
    } catch {
      // The garden also works in memory when tab storage is unavailable.
    }
  }, [plants]);
  const plant = (next: PlantedFlower) =>
    setPlants((previous) => [...previous.filter(({ index }) => index !== next.index), next]);
  return { plants, plant };
}
