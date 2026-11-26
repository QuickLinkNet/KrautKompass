import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../../atoms/Button/Button';
import { AuthLayout } from '../../templates/AuthLayout/AuthLayout';

interface State {
  error: Error | null;
}

/** Fängt Render-Fehler ab, damit nie eine weiße Seite bleibt. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('KrautKompass: unerwarteter Fehler', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <AuthLayout title="Da ist etwas schiefgelaufen" subtitle="Die Seite konnte nicht angezeigt werden.">
        <Button block onClick={() => window.location.assign(import.meta.env.BASE_URL)}>Neu laden</Button>
      </AuthLayout>
    );
  }
}
