import { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { RenderRoutes } from '@/components/route/RenderRoutes';
import { Body } from '@/components/ui/Body';
import Account from '@/sections/Account';
import Assets from '@/sections/Assets';
import { Attributes } from '@/sections/Attributes';
import { AuthenticatedApp } from '@/sections/AuthenticatedApp';
import Files from '@/sections/Files';
import Hello from '@/sections/Hello';
import Intelligence from '@/sections/Intelligence';
import Jobs from '@/sections/Jobs';
import Login from '@/sections/Login';
import Logout from '@/sections/Logout';
import { Overview } from '@/sections/Overview';
import { Risks } from '@/sections/RisksTable';
import { useAuth } from '@/state/auth';
import { getAppRoute, getRoute } from '@/utils/route.util';

function CheckAuth(props: { children: ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();

  if (token) {
    return props.children;
  } else {
    return (
      <Navigate to={getRoute(['login'])} state={{ from: location }} replace />
    );
  }
}

const appRoutes = {
  login: {
    element: <Login />,
    title: 'login',
  },
  hello: {
    element: <Hello />,
    title: 'Hello',
  },
  'app/:userId': {
    element: (
      <CheckAuth>
        <AuthenticatedApp>
          <Outlet />
        </AuthenticatedApp>
      </CheckAuth>
    ),
    logout: {
      element: <Logout />,
      title: 'logout',
    },
    widgets: {
      element: (
        <Body>
          <Intelligence />
        </Body>
      ),
      title: 'Widgets',
    },
    assets: {
      element: <Assets />,
      title: 'Assets',
    },
    risks: {
      element: <Risks />,
      title: 'Risks',
    },
    jobs: {
      element: <Jobs />,
      title: 'Jobs',
    },
    account: {
      element: (
        <Body>
          <Account />
        </Body>
      ),
      title: 'Organization Settings',
    },
    attributes: {
      element: <Attributes />,
      title: 'Attributes',
    },
    files: {
      element: <Files />,
      title: 'Documents',
    },
    overview: {
      element: (
        <Body>
          <Overview />
        </Body>
      ),
      title: 'Overview',
    },
    '*': <Navigate to={getAppRoute(['risks'])} replace />,
  },
  '*': <AppFallback />,
} as const;

function AppFallback() {
  const { token, getDefaultRoute } = useAuth();

  if (token) {
    return <Navigate to={getDefaultRoute()} replace />;
  } else {
    return <Navigate to={getRoute(['login'])} replace />;
  }
}

export function AppRoutes() {
  return <RenderRoutes appRoutes={appRoutes} conditions={{}} />;
}

export type TAppRoutes = typeof appRoutes;
