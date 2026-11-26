import { BrowserRouter } from 'react-router';
import { ErrorBoundary } from './components/organisms/ErrorBoundary/ErrorBoundary';
import { SessionProvider } from './features/session/SessionProvider';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <SessionProvider>
          <AppRoutes />
        </SessionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
