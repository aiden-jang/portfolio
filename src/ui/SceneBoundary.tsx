import { Component, type ReactNode } from 'react';
import { useAppStore } from '../store';
import { SceneFallback } from './SceneFallback';

type Props = { children: ReactNode };
type State = { failed: boolean };

export class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false };
  unsubscribe?: () => void;

  componentDidMount(): void {
    this.unsubscribe = useAppStore.subscribe((state, previous) => {
      if (state.sceneRetryVersion !== previous.sceneRetryVersion) this.setState({ failed: false });
    });
  }

  componentWillUnmount(): void {
    this.unsubscribe?.();
  }

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    useAppStore.setState({ sceneUnavailable: true, isCarLoading: false, hasBodyMaterial: false });
    console.warn('3D scene disabled:', error);
  }

  render(): ReactNode {
    return this.state.failed ? <SceneFallback /> : this.props.children;
  }
}
