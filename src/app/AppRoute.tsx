import { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { RenderRoutes } from '@/components/route/RenderRoutes';
import { Body } from '@/components/ui/Body';
import Account from '@/sections/Account';
import Alerts from '@/sections/Alerts';
import Assets from '@/sections/Assets';
import { AuthenticatedApp } from '@/sections/AuthenticatedApp';
import Files from '@/sections/Files';
import Hello from '@/sections/Hello';
import Intelligence from '@/sections/Intelligence';
import Jobs from '@/sections/Jobs';
import Logout from '@/sections/Logout';
import { Overview } from '@/sections/overview';
import { Report } from '@/sections/Report';
import { Risks } from '@/sections/RisksTable';
import { ForgotPassword, Login, Signup } from '@/sections/signup';
import { LoginSSO } from '@/sections/signup/LoginSSO';
import { useAuth } from '@/state/auth';
import { validateRoutes } from '@/utils/route.util';
import { getRoute } from '@/utils/route.util';

function CheckAuth(props: { children: ReactNode }) {
  const { me } = useAuth();
  const location = useLocation();

  if (me) {
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
    title: 'Login',
  },
  'login-sso': {
    element: <LoginSSO />,
    title: 'Login',
  },
  signup: {
    element: <Signup />,
    title: 'Sign Up',
  },
  'forgot-password': {
    element: <ForgotPassword />,
    title: 'Forgot Password',
  },
  hello: {
    element: <Hello />,
    title: 'Hello',
  },
  app: {
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
    alerts: {
      element: (
        <Body>
          <Alerts />
        </Body>
      ),
      title: 'Alerts',
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
    files: {
      element: <Files />,
      title: 'Documents',
    },
    overview: {
      element: (
        <Body className="bg-header">
          <Overview />
        </Body>
      ),
      title: 'Overview',
    },
    report: {
      element: (
        <Body>
          <Report />
        </Body>
      ),
      title: 'Overview',
    },
    '*': <Navigate to="/app/overview" replace />,
  },
  '*': <Navigate to="/app/overview" replace />,
} as const;

export function AppRoutes() {
  return <RenderRoutes appRoutes={appRoutes} conditions={{}} />;
}

export type TAppRoutes = typeof appRoutes;

// Note: This is just to make sure that the routes are valid
validateRoutes(appRoutes);
