export function frameFromTrigger(
  panel: Element | null,
  trigger: HTMLElement | null,
  travel: number,
  limit: number,
  scale: number,
): Keyframe | undefined {
  if (!panel || !trigger?.isConnected) return;
  const source = trigger.getBoundingClientRect();
  const target = panel.getBoundingClientRect();
  if (!source.width || !source.height || !target.width || !target.height) return;
  const x = (source.left + source.width / 2 - target.left - target.width / 2) * travel;
  const y = (source.top + source.height / 2 - target.top - target.height / 2) * travel;
  const bound = (value: number) => Math.max(-limit, Math.min(value, limit));
  return { opacity: 0, transform: `translate(${bound(x)}px, ${bound(y)}px) scale(${scale})` };
}
