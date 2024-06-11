import { Navigate, Outlet } from 'react-router-dom';

import { Body } from '@/components/ui/Body';
import Account from '@/sections/Account';
import Assets from '@/sections/Assets';
import { Attributes } from '@/sections/Attributes';
import { AuthenticatedApp } from '@/sections/AuthenticatedApp';
import Files from '@/sections/Files';
import Hello from '@/sections/Hello';
import Integrations from '@/sections/Integrations';
import JobsTable from '@/sections/JobsTable';
import Login from '@/sections/Login';
import Logout from '@/sections/Logout';
import { References } from '@/sections/References';
import { Risks } from '@/sections/RisksTable';
import Seeds from '@/sections/Seeds';
import { validateRoutes } from '@/utils/route.util';

import { CheckAuth } from './redirect/CheckAuth';

export const appRoutes = {
  login: {
    element: <Login />,
    title: 'login',
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
    assets: {
      element: <Assets />,
      title: 'Assets',
    },
    seeds: {
      element: <Seeds />,
      title: 'Seeds',
    },
    risks: {
      element: <Risks />,
      title: 'Risks',
    },
    jobs: {
      element: <JobsTable />,
      title: 'Last 24 hours',
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
    references: {
      element: <References />,
      title: 'References',
    },
    files: {
      element: <Files />,
      title: 'Documents',
    },
    integrations: {
      element: (
        <Body>
          <Integrations />
        </Body>
      ),
      title: 'Integrations',
    },
    '*': <Navigate to="/app/risks" replace />,
  },
  '*': <Navigate to="/app/risks" replace />,
} as const;

// Note: This is just to make sure that the routes are valid
validateRoutes(appRoutes);
