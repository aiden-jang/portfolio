import { recordings } from './recordings';
import './showroom-case.css';

type Format = keyof typeof recordings;
type Chapter = 'poster' | 'handoff' | 'drag';

const video = document.querySelector('video')!;
const film = document.querySelector<HTMLElement>('.film')!;
const range = document.querySelector<HTMLInputElement>('#position')!;
const play = document.querySelector<HTMLButtonElement>('#play')!;
const slow = document.querySelector<HTMLButtonElement>('#slow')!;
const display = document.querySelector<HTMLOutputElement>('#time')!;
const caption = document.querySelector<HTMLElement>('#caption')!;
const mediaError = document.querySelector<HTMLElement>('.media-error')!;
const formats = document.querySelectorAll<HTMLButtonElement>('.formats button');
const chapters = document.querySelectorAll<HTMLButtonElement>('.chapters button');
const chapterNames = { poster: 'Poster', handoff: 'First 3D frame', drag: 'First drag' };

let format: Format = matchMedia('(max-width: 760px)').matches ? 'phone' : 'desktop';
let slowMode = false;
let ready = false;
let active: Chapter = 'poster';

const recording = () => recordings[format];
const start = () => (slowMode ? 0 : Math.max(0, recording().handoff - 0.52));
const end = () => Math.min(recording().duration, video.duration);
const duration = () => Math.max(0.1, end() - start());

function mark(chapter: Chapter) {
  active = chapter;
  for (const button of chapters)
    button.setAttribute('aria-current', String(button.dataset.chapter === chapter));
  caption.textContent =
    chapter === 'poster'
      ? slowMode
        ? `The model request was held open for about ${recording().withheld.toFixed(1)} seconds from the start of the recording. The poster stays on screen.`
        : 'A pre-rendered Studio image fills the opening while the Ferrari model downloads.'
      : chapter === 'handoff'
        ? 'The rendered frame arrives at the same camera angle. The poster fades out and the opening orbit begins.'
        : 'A real drag takes over the view at the current angle.';
}

function update() {
  if (!ready) return;
  const time = video.currentTime;
  const elapsed = Math.max(0, time - start());
  range.value = String(Math.round(Math.min(1, elapsed / duration()) * 1000));
  display.value = elapsed.toFixed(1) + ' s';
  const phase =
    time >= recording().drag ? 'drag' : time >= recording().handoff ? 'handoff' : 'poster';
  if (phase !== active) mark(phase);
  range.setAttribute('aria-valuetext', display.value + ', ' + chapterNames[phase]);
}

function seek(time: number) {
  video.currentTime = Math.max(start(), Math.min(time, end()));
  update();
}

function updatePlayback() {
  const stopped = video.paused || video.ended;
  play.querySelector('span')!.textContent = stopped ? 'Play' : 'Pause';
  play.setAttribute('aria-label', stopped ? 'Play handoff' : 'Pause replay');
  document
    .querySelector('#play-icon')!
    .setAttribute('d', stopped ? 'M6 4l10 6-10 6z' : 'M5 4h3v12H5zm7 0h3v12h-3z');
}

function enableControls(enabled: boolean) {
  for (const control of [range, play, slow, ...chapters]) control.disabled = !enabled;
}

function load() {
  ready = false;
  enableControls(false);
  mediaError.hidden = true;
  video.pause();
  slowMode = false;
  slow.setAttribute('aria-pressed', 'false');
  mark('poster');
  display.value = '0.0 s';
  range.value = '0';
  film.dataset.format = format;
  for (const button of formats)
    button.setAttribute('aria-pressed', String(button.dataset.format === format));
  video.poster = `/showroom/case/${format}-poster.jpg`;
  video.src = `/showroom/case/${format}.mp4`;
  video.load();
}

video.addEventListener('loadedmetadata', () => {
  ready = true;
  seek(start());
  enableControls(true);
});
video.addEventListener('error', () => {
  ready = false;
  mediaError.hidden = false;
  enableControls(false);
});
for (const event of ['timeupdate', 'seeked', 'loadeddata']) video.addEventListener(event, update);
for (const event of ['play', 'pause', 'ended']) video.addEventListener(event, updatePlayback);

for (const button of formats)
  button.onclick = () => {
    const next = button.dataset.format;
    if ((next === 'desktop' || next === 'phone') && next !== format) {
      format = next;
      load();
    }
  };

document.querySelector<HTMLButtonElement>('#retry')!.onclick = load;
range.oninput = () => {
  video.pause();
  seek(start() + (range.valueAsNumber / 1000) * duration());
};
for (const button of chapters)
  button.onclick = () => {
    const current = recording();
    const points = { poster: start(), handoff: current.live + 0.03, drag: current.dragEnd + 0.05 };
    video.pause();
    seek(points[button.dataset.chapter as Chapter]);
  };
play.onclick = () => {
  if (!video.paused) {
    video.pause();
    return;
  }
  if (video.ended || video.currentTime >= end() - 0.2) seek(start());
  void video.play().catch(updatePlayback);
};
slow.onclick = () => {
  video.pause();
  slowMode = !slowMode;
  slow.setAttribute('aria-pressed', String(slowMode));
  mark('poster');
  seek(start());
  if (slowMode) void video.play().catch(updatePlayback);
};

load();
