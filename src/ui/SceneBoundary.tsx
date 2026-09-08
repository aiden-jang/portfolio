import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

// The 3D is decorative and the DOM portfolio works without it, so a missing WebGL context or a
// failed GLB should drop the canvas rather than throw past Suspense and blank the page.
export class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.warn('3D scene disabled:', error);
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
