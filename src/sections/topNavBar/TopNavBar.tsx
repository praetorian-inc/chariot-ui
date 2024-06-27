import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

import { Dropdown } from '@/components/Dropdown';
import GlobalSearch from '@/components/GlobalSearch';
import { Hexagon } from '@/components/Hexagon';
import { AssetsIcon, RisksIcon, SeedsIcon } from '@/components/icons';
import { LogoIcon } from '@/components/icons/Logo.icon';
import { Shortcuts } from '@/components/ui/Shortcuts';
import { AccountDropdown } from '@/sections/topNavBar/AccountDropdown';
import { Notifications } from '@/sections/topNavBar/Notifications';
import { getRoute } from '@/utils/route.util';
import { Button } from '@/components/Button';

export function TopNavBar() {
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-between py-3 md:flex-row">
      <div className="flex w-full items-center">
        <div className="flex w-full flex-wrap items-center">
          <Link to={getRoute(['app', 'risks'])}>
            <LogoIcon className="mr-4 size-9" />
          </Link>
          <Button
            styleType="header"
            onClick={() => {
              navigate(getRoute(['app', 'overview']));
            }}
            className="header bg-header text-medium"
          >
            Overview
          </Button>
          <Dropdown
            label="Attack Surface"
            styleType="none"
            endIcon={<ChevronDownIcon className="size-4 " />}
            menu={{
              className: 'w-96',
              items: [
                {
                  label: 'Seeds',
                  description:
                    'Manage entry points to discover and monitor assets for scanning.',
                  helpText: <Shortcuts value="S" />,
                  icon: (
                    <div>
                      <SeedsIcon className="-ml-2 size-7 stroke-1" />
                    </div>
                  ),
                  to: getRoute(['app', 'seeds']),
                },
                {
                  label: 'Assets',
                  description:
                    'Track and manage discovered assets to ensure comprehensive scanning.',
                  helpText: <Shortcuts value="A" />,
                  icon: (
                    <div>
                      <AssetsIcon className="-ml-2 size-7 stroke-1" />
                    </div>
                  ),
                  to: getRoute(['app', 'assets']),
                },
                {
                  label: 'Risks',
                  description:
                    'Identify, evaluate, and prioritize risks in your assets to protect your organization.',
                  helpText: <Shortcuts value="R" />,
                  icon: (
                    <div>
                      <RisksIcon className="-ml-2 size-7 stroke-1" />
                    </div>
                  ),
                  to: getRoute(['app', 'risks']),
                },
              ],
            }}
          />
          <div className="ml-auto flex items-center md:order-last md:ml-0">
            <div className="ml-4">
              <Hexagon notify={showNotification}>
                <Notifications
                  onNotify={shouldShow => {
                    setShowNotification(shouldShow);
                  }}
                  onClick={() => setShowNotification(false)}
                />
              </Hexagon>
            </div>
            <AccountDropdown />
          </div>
          <div className="ml-auto mt-2 w-full md:mt-0 md:w-auto">
            <GlobalSearch />
          </div>
        </div>
      </div>
    </div>
  );
}
