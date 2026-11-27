import { useEffect, useState } from 'react';
import { gardenFlowers } from './gardenFlowers';

function makeCutting(index: number, head: HTMLImageElement, morning: boolean) {
  const sprite = document.createElement('canvas');
  sprite.width = 23;
  sprite.height = 50;
  const ctx = sprite.getContext('2d')!;
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  const stem = index === 1 ? '#738a4c' : '#739980';
  rect(12, 11, 1, 10, stem);
  rect(11, 21, 1, 19, stem);
  rect(9, 23, 2, 2, stem);
  rect(7, 21, 3, 2, stem);
  rect(12, 28, 3, 1, stem);
  rect(14, 26, 3, 2, stem);
  ctx.drawImage(head, 2, 0, 21, 21);
  // Quantize the feathered SVG edge to the room's opaque pixel palette.
  const bloom = ctx.getImageData(2, 0, 21, 21);
  for (let alpha = 3; alpha < bloom.data.length; alpha += 4) {
    bloom.data[alpha] = bloom.data[alpha] >= 72 ? 255 : 0;
  }
  ctx.putImageData(bloom, 2, 0);
  // A squat glazed bud vase sits on the same half-pixel grid as Bean's furniture.
  ctx.save();
  ctx.translate(0, 11);
  rect(8, 27, 7, 2, '#45483f');
  rect(9, 29, 5, 2, '#83aca1');
  rect(7, 31, 9, 1, '#45584f');
  rect(6, 32, 11, 5, '#41584f');
  rect(7, 32, 9, 4, '#7da398');
  rect(7, 32, 3, 2, '#c0caba');
  rect(14, 33, 2, 4, '#628a80');
  rect(7, 37, 9, 1, '#617e73');
  rect(8, 38, 7, 1, '#45483f');
  ctx.restore();
  if (!morning) {
    ctx.globalCompositeOperation = 'source-atop';
    rect(0, 0, sprite.width, sprite.height, 'rgba(118,64,44,.15)');
  }
  return sprite;
}

export function useSillFlower(index: number | undefined, morning: boolean) {
  const [sprite, setSprite] = useState<{
    index: number;
    morning: boolean;
    image: HTMLCanvasElement;
  } | null>(null);
  useEffect(() => {
    if (index === undefined) return;
    const svg = new DOMParser().parseFromString(
      gardenFlowers[index].art,
      'image/svg+xml',
    ).documentElement;
    const head = svg.querySelector('.studio-flower-head')!;
    svg.replaceChildren(head);
    svg.setAttribute('viewBox', '-8 -18 96 96');
    svg.setAttribute('width', '21');
    svg.setAttribute('height', '21');
    const image = new Image();
    image.onload = () => setSprite({ index, morning, image: makeCutting(index, image, morning) });
    image.src =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(new XMLSerializer().serializeToString(svg));
    return () => {
      image.onload = null;
    };
  }, [index, morning]);
  return sprite?.index === index && sprite?.morning === morning ? sprite?.image : undefined;
}
