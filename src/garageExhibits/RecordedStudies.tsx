import { useState } from 'react';
import './recorded-studies.css';

const directory = '/showroom/exhibits/';

export function RenderComparison() {
  const [split, setSplit] = useState(50);
  const [pass, setPass] = useState<'clay' | 'reflection'>('reflection');
  return (
    <figure className="recorded-study">
      <figcaption>Recorded F40 · matched camera</figcaption>
      <div className="recorded-study-frame">
        <img src={directory + 'render-finished.webp'} alt="Finished Ferrari F40 in Studio" />
        <img
          className="render-comparison-pass"
          style={{ clipPath: `inset(0 0 0 ${split}%)` }}
          src={directory + 'render-' + pass + '.webp'}
          alt={pass === 'clay' ? 'Matte clay pass' : 'Floor reflection pass'}
        />
        <span
          className="render-comparison-guide"
          style={{ left: split + '%' }}
          aria-hidden="true"
        />
      </div>
      <label>
        Finished / {pass}
        <input
          type="range"
          min="0"
          max="100"
          value={split}
          onChange={(e) => setSplit(e.target.valueAsNumber)}
        />
      </label>
      <div className="garage-exhibit-set" role="group" aria-label="Recorded passes">
        <button
          type="button"
          aria-pressed={pass === 'reflection'}
          onClick={() => setPass('reflection')}
        >
          Reflection
        </button>
        <button type="button" aria-pressed={pass === 'clay'} onClick={() => setPass('clay')}>
          Clay
        </button>
      </div>
    </figure>
  );
}

const wedges = [
  {
    id: 'f40',
    name: 'Ferrari F40',
    roof: 'The windshield joins a shallow roof arc before the deck drops away.',
    tail: 'The rear wing carries the top line past the engine deck.',
    traces: {
      roof: '389,78 450,53 504,27 545,20 659,20 724,25 790,42',
      tail: '841,70 849,46 934,21 975,20 983,72 981,145 969,188 902,205',
    },
  },
  {
    id: 'countach',
    name: 'Lamborghini Countach',
    roof: 'A straight windshield runs into the low, flat roof.',
    tail: 'The wing and sharply angled tail continue the wedge behind the rear wheel.',
    traces: {
      roof: '360,63 412,45 484,18 612,16 657,19 681,26',
      tail: '840,34 927,17 936,7 998,6 985,22 945,23 925,56 984,70 984,104 937,147',
    },
  },
  {
    id: '917k',
    name: 'Porsche 917K',
    roof: 'The rounded canopy rises directly from the front fender line.',
    tail: 'The body sweeps upward toward the short, squared-off tail.',
    traces: {
      roof: '354,86 409,65 464,50 510,47 583,47 617,54',
      tail: '775,60 832,53 904,44 940,35 991,31 979,62 975,84 908,97',
    },
  },
] as const;

export function WedgeStudy() {
  const [choice, setChoice] = useState(0);
  const [detail, setDetail] = useState<'roof' | 'tail'>('roof');
  const car = wedges[choice];
  return (
    <figure className="recorded-study">
      <figcaption>Three ways to draw a wedge</figcaption>
      <div className="recorded-study-frame" data-wedge-detail={detail}>
        <img src={directory + 'wedge-' + car.id + '.jpg'} alt={car.name + ' in profile'} />
        <svg aria-hidden="true" viewBox="0 0 1100 293">
          <polyline
            points={car.traces[detail]}
            fill="none"
            stroke="#fff3ca"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="garage-exhibit-set" role="group" aria-label="Wedge profiles">
        {wedges.map((wedge, index) => (
          <button
            key={wedge.id}
            type="button"
            aria-pressed={choice === index}
            onClick={() => setChoice(index)}
          >
            {wedge.name}
          </button>
        ))}
      </div>
      <div className="garage-exhibit-set" role="group" aria-label="Profile detail">
        <button type="button" aria-pressed={detail === 'roof'} onClick={() => setDetail('roof')}>
          Roofline
        </button>
        <button type="button" aria-pressed={detail === 'tail'} onClick={() => setDetail('tail')}>
          Tail
        </button>
      </div>
      <p>{car[detail]}</p>
    </figure>
  );
}
