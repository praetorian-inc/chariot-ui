import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export function TopNavBar() {
  const [showNotification, setShowNotification] = useState<boolean>(false);

  return (
    <div className="flex flex-col items-center justify-between py-3 md:flex-row">
      <div className="flex w-full items-center">
        <div className="flex w-full items-center">
          <Link to={getRoute(['app', 'risks'])}>
            <LogoIcon className="mr-4 size-9" />
          </Link>
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
                    "Define your scope by adding the domains, IP's, or repositories you wish to monitor.",
                  helpText: <Shortcuts value="S" />,
                  icon: <SeedsIcon />,
                  to: getRoute(['app', 'seeds']),
                },
                {
                  label: 'Assets',
                  description:
                    'Discover all objects and elements associated with your Seeds.',
                  helpText: <Shortcuts value="A" />,
                  icon: <AssetsIcon />,
                  to: getRoute(['app', 'assets']),
                },
                {
                  label: 'Risks',
                  description:
                    'Identify, prioritize, and mitigate threats located within your Assets.',
                  helpText: <Shortcuts value="R" />,
                  icon: <RisksIcon />,
                  to: getRoute(['app', 'risks']),
                },
              ],
            }}
          />
          <Link to={getRoute(['app', 'intelligence'])} className="ml-4 text-sm">
            Intelligence
          </Link>
          <div className="ml-auto flex items-center md:hidden">
            <Notifications />
            <AccountDropdown />
          </div>
        </div>
      </div>
      <div className="flex w-full items-center md:w-auto">
        <GlobalSearch />
        <div className="hidden items-center md:flex">
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
      </div>
    </div>
  );
}
