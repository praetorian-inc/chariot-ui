import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { BreadCrumbs } from '@/components/BreadCrumbs';
import ImpersonationBanner from '@/components/ImpersonationBanner';
import { Loader } from '@/components/Loader';
import { ShortcutsHelper } from '@/components/ui/Shortcuts';
import { useMy } from '@/hooks';
import { useGetDisplayName } from '@/hooks/useAccounts';
import { AddAsset } from '@/sections/add/AddAsset';
import { AddFile } from '@/sections/add/AddFile';
import { AddRisks } from '@/sections/add/AddRisks';
import { DetailsDrawer } from '@/sections/detailsDrawer';
import { NewUserSeedModal } from '@/sections/NewUserSeedModal';
import { IntegrationsByModuleCategoryModal } from '@/sections/overview';
import { ProofOfExploit } from '@/sections/ProofOfExploit';
import { TopNavBar } from '@/sections/topNavBar/TopNavBar';
import { Upgrade } from '@/sections/Upgrade';
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

  const { data: accounts, status: accountsStatus } = useMy({
    resource: 'account',
  });

  const showUpgrade = useMemo(() => {
    return Boolean(
      friend.email === '' &&
        !accounts.some(account => account.member.endsWith('praetorian.com'))
    );
  }, [accountsStatus, JSON.stringify(accounts), JSON.stringify(friend)]);

  const displayName = useGetDisplayName(accounts);

  const navigate = useNavigate();
  const [shortcutsHelper, setShortcutsHelper] = useState(false);

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
    label: displayName || friend.displayName || friend.email || me,
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
      <ImpersonationBanner />
      <NewUserSeedModal />
      <ProofOfExploit />
      <AddRisks />
      <AddAsset />
      <AddFile />
      <IntegrationsByModuleCategoryModal />
      {accountsStatus === 'success' && showUpgrade && <Upgrade />}
    </div>
  );
}

const HeaderPortalSections = {
  BREADCRUMBS: 'header-breadcrumbs-section',
  EXTRA_CONTENT: 'header-extra-content-section',
};

export function Header() {
  const { friend } = useAuth();
  const { status: statusAccount } = useMy({ resource: 'account' });
  const { breadcrumbs } = useBreadCrumbsContext();

  // TODO: FIXME - this is a hack to not show sticky header on table pages
  const showSticky = ['assets', 'risks', 'seeds', 'jobs', 'documents'].includes(
    breadcrumbs[1]?.label?.toLowerCase()
  );

  return (
    <>
      <div
        className={cn(
          `${friend?.email?.length > 0 && 'pt-[10px]'} flex flex-col items-center w-full bg-header text-header px-4`
        )}
      >
        <div className="w-full max-w-screen-xl">
          <TopNavBar />
          <hr className="h-px bg-layer0 opacity-15" />
          <div className={cn('flex items-center justify-between gap-10')}>
            <Loader
              styleType="header"
              className="my-9 h-11 w-1/2"
              isLoading={statusAccount === 'pending'}
            >
              <BreadCrumbs breadcrumbs={breadcrumbs} />
            </Loader>
            <div id={HeaderPortalSections.BREADCRUMBS} className="shrink-0" />
          </div>
        </div>
      </div>
      <div
        className={cn('w-full bg-header pt-4', showSticky && 'sticky top-0')}
        style={{ zIndex: 1 }}
      >
        <div
          id={HeaderPortalSections.EXTRA_CONTENT}
          className="m-auto max-w-screen-xl [&:has(*)]:pb-9"
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
