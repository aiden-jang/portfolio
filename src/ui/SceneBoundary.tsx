import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

/** Catches runtime errors from the 3D scene — no WebGL context (locked-down
 *  machines, GPU blocklists, old devices), a failed GLB, a lost context — so a
 *  broken canvas silently disappears instead of throwing past Suspense and
 *  blanking the whole page. The 3D is decorative; the DOM portfolio is fully
 *  usable without it. */
export class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    // Non-fatal: log for diagnostics, then render nothing in the canvas slot.
    console.warn('3D scene disabled:', error);
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
