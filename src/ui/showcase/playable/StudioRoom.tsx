import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Cat, type RoomAction, type RoomPositions } from '../mrrp/renderer.js';
import { clamp } from '../../../math';
import { useBeanToyDrag } from '../useBeanToyDrag';
import { RoomFooter } from './RoomFooter';
import { gardenFlowers, type PlantedFlower } from './gardenFlowers';
import { useSillFlower } from './useSillFlower';

const look = {
  name: 'Bean',
  fur: '#e39348',
  furDk: '#b96d38',
  belly: '#fbefdb',
  eyes: '#7cb342',
  tabby: true,
};
function roomTime(hour: number) {
  const offset = ((new Date().getUTCHours() - hour + 36) % 24) - 12;
  return {
    tz: offset ? `Etc/GMT${offset > 0 ? '+' : ''}${offset}` : 'UTC',
    homeHour: 18,
  };
}
function variable(el: HTMLElement, name: string, val: string) {
  if (el.style.getPropertyValue(name) !== val) el.style.setProperty(name, val);
}
export type RoomParts = {
  world: React.RefObject<HTMLDivElement>;
  print: React.RefObject<HTMLCanvasElement>;
  landing: React.MutableRefObject<number | null>;
};

export function Room({
  flower,
  backToGarden,
  active,
  marked,
  master,
  parts,
  onReady,
  reduced,
  roomLink,
  returnToPad,
}: {
  flower: PlantedFlower | null;
  backToGarden: () => void;
  active: boolean;
  marked: boolean;
  master: HTMLCanvasElement;
  parts: RoomParts;
  onReady: () => void;
  roomLink: React.ReactNode;
  returnToPad: () => void;
  reduced: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const hotspots = useRef<HTMLDivElement>(null);
  const sillTarget = useRef<HTMLButtonElement>(null);
  const [reserve, setReserve] = useState(150);
  const [paintPixels, setPaintPixels] = useState(true);
  const [reply, setReply] = useState<{
    plant: PlantedFlower | null;
    text: string;
    note?: boolean;
  } | null>(null);
  const welcome = flower
    ? `Tap ${flower.example ? 'the' : 'your'} ${gardenFlowers[flower.index].name.toLowerCase()} on the sill.`
    : 'Tap Bean or drag her mouse.';
  const feedback = reply && reply.plant === flower ? reply.text : welcome;
  const [action, setAction] = useState<{
    kind: RoomAction;
    count: number;
  } | null>(null);
  const [pets, setPets] = useState(0);
  const [petAt, setPetAt] = useState<number | null>(null);
  const [morning, setMorning] = useState(false);
  const sillFlower = useSillFlower(flower?.index, morning);
  const clock = useMemo(() => roomTime(morning ? 9 : 18), [morning]);
  useLayoutEffect(() => {
    const el = host.current!;
    const measure = () => setReserve(Math.max(100, window.innerHeight - el.clientHeight));
    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting) sillTarget.current?.removeAttribute('data-painted');
        setPaintPixels(entry.isIntersecting);
      },
      { rootMargin: '360px 0px' },
    );
    nearby.observe(el.closest('.studio-route') ?? el);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => {
      observer.disconnect();
      nearby.disconnect();
    };
  }, []);

  const position = useCallback(
    (p: RoomPositions) => {
      const box = host.current,
        layer = hotspots.current;
      const canvas = box?.querySelector<HTMLCanvasElement>(':scope > canvas');
      if (!box || !layer || !canvas || !canvas.width || !canvas.height) return;
      const w = box.clientWidth,
        h = box.parentElement!.clientHeight;
      const fill = Math.max(w / canvas.width, h / canvas.height);
      const width = canvas.width * fill,
        height = canvas.height * fill;
      const fx = (p.picture + p.center) / 2;
      const preferred = w * (w < 700 ? 0.51 : 0.44) - width * fx;
      const sillClearance = w - width * (p.sill[0] + p.sill[2] / 2) - 5;
      const left = clamp(
        w < 700 && flower ? Math.min(preferred, sillClearance) : preferred,
        w - width,
        0,
      );
      const top = clamp(h * 0.5 - height * 0.49, h - height, 0);
      for (const [name, n] of [
        ['x', left],
        ['y', top],
        ['w', width],
        ['h', height],
      ] as const)
        variable(box, '--view-' + name, `${n.toFixed(2)}px`);
      const pct = (x: number) => `${(x * 100).toFixed(4)}%`;
      for (const [name, point] of [
        ['paper-x', p.paper[0]],
        ['paper-y', p.paper[1]],
        ['paper-w', p.paper[2]],
        ['paper-h', p.paper[3]],
        ['bean-x', p.bean[0]],
        ['bean-y', p.bean[1]],
        ['box-x', p.box[0]],
        ['box-y', p.box[1]],
        ['mouse-x', p.mouse[0]],
        ['mouse-y', p.mouse[1]],
        ['sill-x', p.sill[0]],
        ['sill-y', p.sill[1]],
        ['sill-w', p.sill[2]],
        ['sill-h', p.sill[3]],
      ] as const)
        variable(layer, '--' + name, pct(point));
      if (!layer.dataset.positioned) layer.dataset.positioned = 'true';
      const target = sillTarget.current;
      if (sillFlower && target && !target.dataset.painted) target.dataset.painted = 'true';
    },
    [flower, sillFlower],
  );

  function say(text: string) {
    setReply({ plant: flower, text });
  }
  function interact(kind: RoomAction) {
    setAction((old) => ({ kind, count: (old?.count || 0) + 1 }));
  }
  function pet() {
    interact('pet');
    setPets((n) => n + 1);
    setPetAt(Date.now());
    say('Bean leans into your hand. Mrrp!');
  }
  function toss() {
    interact('mouse');
    say('Bean crouches and pounces on her mouse.');
  }
  function box() {
    if (action?.kind === 'box') {
      setAction(null);
      say('Bean steps out of the box.');
    } else {
      interact('box');
      say('Two ears peek over the edge of the box.');
    }
  }
  function light() {
    setMorning(!morning);
    say(morning ? 'Evening light fills the room.' : 'Morning light comes through the window.');
  }
  const { toy, toyDrag, onMouse } = useBeanToyDrag(hotspots, toss, () => {
    setAction(null);
    say('Bean follows the toy.');
  });
  return (
    <div
      className="room-unit"
      aria-hidden={!active}
      data-action={action?.kind || 'idle'}
      data-pets={pets}
      data-light={morning ? 'morning' : 'evening'}
    >
      <div className="room-aperture">
        <div className="room-world" ref={parts.world}>
          <div className="native-room" ref={host}>
            {paintPixels && (
              <Cat
                key={String(reduced)}
                label="Bean’s pixel-art room."
                look={look}
                clock={clock}
                mood={null}
                nudge={pets}
                reserveBelow={reserve}
                role={null}
                petAt={petAt}
                onPet={pet}
                together={false}
                sitting={false}
                staying={false}
                satWith={false}
                spot={null}
                roomPlay={{
                  action,
                  onPositions: position,
                  onFirstFrame: onReady,
                  toy,
                  print: master,
                  flower: sillFlower,
                  landing: parts.landing,
                }}
              />
            )}
            <div className="room-objects" ref={hotspots}>
              <canvas
                width={master.width}
                height={master.height}
                ref={parts.print}
                className="framed-print"
                role="img"
                aria-label={
                  marked
                    ? 'Your drawing in the picture frame'
                    : 'Bean’s portrait in the picture frame'
                }
              />
              <button
                type="button"
                className="room-hit hit-bean"
                aria-label="Pet Bean"
                onClick={pet}
              >
                <span>Pet Bean</span>
              </button>
              <button
                type="button"
                className="room-hit hit-box"
                aria-label="Play with the cardboard box"
                aria-pressed={action?.kind === 'box'}
                onClick={box}
              >
                <span>Cardboard box</span>
              </button>
              {flower && (
                <button
                  type="button"
                  key={flower.index}
                  ref={sillTarget}
                  className="room-hit hit-flower"
                  aria-label={`Read ${flower.example ? 'the' : 'your'} ${gardenFlowers[flower.index].name} note on the windowsill`}
                  aria-expanded={reply?.plant === flower && !!reply.note}
                  onClick={(event) => {
                    setReply({ plant: flower, text: flower.note, note: true });
                    if (event.detail === 0)
                      requestAnimationFrame(() => {
                        document
                          .getElementById('sill-garden-return')
                          ?.focus({ preventScroll: true });
                      });
                  }}
                >
                  <span>{gardenFlowers[flower.index].name}</span>
                </button>
              )}
              <button
                type="button"
                className="room-hit hit-mouse"
                aria-label="Play with the toy mouse"
                onClick={onMouse}
                {...toyDrag}
              >
                <span>Toy mouse</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <RoomFooter
        roomLink={roomLink}
        feedback={feedback}
        reading={!!flower && reply?.plant === flower && !!reply.note}
        backToGarden={backToGarden}
        returnToPad={returnToPad}
        toss={toss}
        morning={morning}
        light={light}
      />
    </div>
  );
}
