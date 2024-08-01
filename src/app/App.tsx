import { BrowserRouter } from 'react-router-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { AppRoutes } from '@/app/AppRoute';
import { useInitAxiosInterceptors } from '@/hooks/useAxios';
import { queryClient } from '@/queryclient';
import AuthProvider from '@/state/auth';
import { BreadCrumbsProvider } from '@/state/breadcrumbs';
import { GlobalStateProvider } from '@/state/global.state';
import { SearchProvider } from '@/state/search';
import { QueryClientProvider } from '@/utils/api';

function AppComponent() {
  useInitAxiosInterceptors();
  (function () {
    const currentVersion = '0.24.0';
    const versionKey = 'chariot';
    const storedVersion = localStorage.getItem(versionKey);

    if (storedVersion === null || storedVersion !== currentVersion) {
      // Clear localStorage
      localStorage.clear();

      // Set the new version
      localStorage.setItem(versionKey, currentVersion);

      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  })();

  return <AppRoutes />;
}

// ThirdPartyProviders is a wrapper for third-party providers like react-query, react-router, etc.
function ThirdPartyProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {import.meta.env.DEV && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        )}
        <Toaster richColors position="bottom-right" />
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
}

// AppProviders is a wrapper for providers like AuthProvider, etc that can be used anywhere in the app.
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GlobalStateProvider>
      <AuthProvider>
        <SearchProvider>
          <BreadCrumbsProvider>{children}</BreadCrumbsProvider>
        </SearchProvider>
      </AuthProvider>
    </GlobalStateProvider>
  );
}

export function App() {
  return (
    <ThirdPartyProviders>
      <AppProviders>
        <AppComponent />
      </AppProviders>
    </ThirdPartyProviders>
  );
}
