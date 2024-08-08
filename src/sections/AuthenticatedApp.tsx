import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { ShortcutsHelper } from '@/components/ui/Shortcuts';
import { useMy } from '@/hooks';
import { useGetAccountDetails } from '@/hooks/useAccounts';
import { AddAsset } from '@/sections/add/AddAsset';
import { AddFile } from '@/sections/add/AddFile';
import { AddRisks } from '@/sections/add/AddRisks';
import { DetailsDrawer } from '@/sections/detailsDrawer';
import { NewUserSeedModal } from '@/sections/NewUserSeedModal';
import { ModulesModal } from '@/sections/overview';
import { ProofOfExploit } from '@/sections/ProofOfExploit';
import { TopNavBar } from '@/sections/topNavBar/TopNavBar';
import { UpgradeModal } from '@/sections/Upgrade';
import { useAuth } from '@/state/auth';
import { useBreadCrumbsContext } from '@/state/breadcrumbs';
import { cn } from '@/utils/classname';
import { getRoute } from '@/utils/route.util';

const offsetViewMargin = 16;
interface AuthenticatedApp {
  children: ReactNode;
}

function AuthenticatedAppComponent(props: AuthenticatedApp) {
  const { children } = props;

  const headerRef = useRef<HTMLDivElement>(null);

  const { useBreadCrumb } = useBreadCrumbsContext();
  const { me, friend } = useAuth();

  const { data: accounts } = useMy({
    resource: 'account',
  });

  const { name: displayName } = useGetAccountDetails(accounts);

  const navigate = useNavigate();
  const [shortcutsHelper, setShortcutsHelper] = useState(false);

  // @types/node
  let timeout: NodeJS.Timeout;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      resetShortcuts();
      if (event.ctrlKey && event.key) {
        switch (event.key) {
          case 'a':
          case 'A':
            navigate(getRoute(['app', 'assets']));
            break;
          case 'r':
          case 'R':
            navigate(getRoute(['app', 'risks']));
            break;
          case 'j':
          case 'J':
            navigate(getRoute(['app', 'jobs']));
            break;
        }

        timeout = setTimeout(() => {
          setShortcutsHelper(true);
        }, 1500);
      }
    }

    function resetShortcuts() {
      setShortcutsHelper(false);
      timeout && clearTimeout(timeout);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', resetShortcuts);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', resetShortcuts);
    };
  }, []);

  useBreadCrumb({
    label: displayName || friend || me,
    order: 1,
  });

  return (
    <div
      className={'flex h-full flex-col items-center overflow-hidden bg-layer1'}
    >
      <div
        className="grow-1 flex size-full justify-center"
        style={{
          maxHeight: `calc(100% - ${(headerRef.current?.clientHeight || 0) - offsetViewMargin}px)`,
        }}
      >
        {children}
      </div>
      {shortcutsHelper && (
        <ShortcutsHelper onClose={() => setShortcutsHelper(false)} />
      )}
      <DetailsDrawer />
      <NewUserSeedModal />
      <ProofOfExploit />
      <AddRisks />
      <AddAsset />
      <AddFile />
      <ModulesModal />
      <UpgradeModal />
    </div>
  );
}

export const HeaderPortalSections = {
  BREADCRUMBS: 'header-breadcrumbs-section',
  EXTRA_CONTENT: 'header-extra-content-section',
};

export function Header() {
  const { breadcrumbs } = useBreadCrumbsContext();

  // TODO: FIXME - this is a hack to not show sticky header on table pages
  const showSticky = ['assets', 'risks', 'jobs'].includes(
    breadcrumbs[1]?.label?.toLowerCase()
  );

  return (
    <>
      <div
        className={cn(
          `flex flex-col items-center w-full bg-header text-header px-4`
        )}
      >
        <div className="w-full max-w-screen-xl">
          <TopNavBar />
        </div>
      </div>
      <div
        className={cn('w-full bg-header pt-4', showSticky && 'sticky top-0')}
        style={{ zIndex: 1 }}
      >
        <div
          id={HeaderPortalSections.EXTRA_CONTENT}
          className="m-auto max-w-screen-xl text-[10px] [&:has(*)]:pb-7"
        />
      </div>
    </>
  );
}

export function RenderHeaderBreadcrumbSection({
  children,
}: {
  children: ReactNode;
}) {
  const BreadcrumbSection = document.getElementById(
    HeaderPortalSections.BREADCRUMBS
  );

  if (!BreadcrumbSection) {
    return null;
  }

  return createPortal(children, BreadcrumbSection);
}

export function RenderHeaderExtraContentSection({
  children,
}: {
  children: ReactNode;
}) {
  const ExtraContentSection = document.getElementById(
    HeaderPortalSections.EXTRA_CONTENT
  );

  if (!ExtraContentSection) {
    return null;
  }

  return createPortal(children, ExtraContentSection);
}

function AuthenticatedAppProviders(props: { children: ReactNode }) {
  return props.children;
}

export function AuthenticatedApp(props: AuthenticatedApp) {
  return (
    <AuthenticatedAppProviders>
      <AuthenticatedAppComponent {...props} />
    </AuthenticatedAppProviders>
  );
}
