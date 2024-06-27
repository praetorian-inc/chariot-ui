import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { AppRoutes } from '@/app/AppRoute';
import { useInitAxiosInterceptors } from '@/hooks/useAxios';
import { queryClient } from '@/queryclient';
import AuthProvider from '@/state/auth';
import { BreadCrumbsProvider } from '@/state/breadcrumbs';
import { GlobalStateProvider } from '@/state/global.state';
import { SearchProvider } from '@/state/search';
import { QueryClientProvider } from '@/utils/api';

import 'react-toastify/dist/ReactToastify.css';

function AppComponent() {
  useInitAxiosInterceptors();

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
        <ToastContainer
          hideProgressBar={true}
          closeOnClick
          newestOnTop={false}
          stacked
          position="top-right"
          autoClose={3000}
          draggablePercent={30}
          draggable
          limit={3}
        />
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
