import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDownCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import { PhotoIcon } from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { Hexagon } from '@/components/Hexagon';
import { AssetsIcon, RisksIcon } from '@/components/icons';
import { LogoIcon } from '@/components/icons/Logo.icon';
import { Shortcuts } from '@/components/ui/Shortcuts';
import { AccountDropdown } from '@/sections/topNavBar/AccountDropdown';
import { Notifications } from '@/sections/topNavBar/Notifications';
import { getRoute } from '@/utils/route.util';

export function TopNavBar() {
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const asmPages = ['assets', 'risks'];
  const currentPage = location.pathname.split('/').pop();
  const subtitles = {
    assets:
      'Configure and track discovered assets to ensure thorough security scans and risk assessment.',
    risks:
      'Identify and prioritize risks in assets to protect your organization.',
    files:
      'Store, share, and retrieve all documents, including reports, definitions, proof of exploits, and manually uploaded files.',
    widgets: 'Create and customize dashboards to gain insights into your data.',
    account: 'Adjust settings specific to your organization.',
    jobs: 'Track the status and results of recent security scans from the past 24 hours.',
    overview:
      'Monitor your attack surface and review daily reports with critical findings and recommendations.',
  };
  const icons = {
    assets: <AssetsIcon className=" size-7 stroke-1 text-default-light" />,
    risks: <RisksIcon className=" size-7 stroke-1 text-default-light" />,
    files: <></>,
    widgets: <PhotoIcon className=" size-7 stroke-1 text-default-light" />,
    account: <></>,
    jobs: (
      <ArrowDownCircleIcon className=" size-7 stroke-1 text-default-light" />
    ),
    overview: <></>,
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-between py-3 md:flex-row">
        <div className="flex w-full items-center">
          <div className="flex w-full flex-nowrap items-center">
            <Link to={getRoute(['app', 'risks'])}>
              <LogoIcon className="mr-4 size-9" />
            </Link>
            <nav className="flex w-full items-center">
              <button
                onClick={() => navigate(getRoute(['app', 'overview']))}
                className="mr-4 py-3 text-sm font-medium"
              >
                Overview
              </button>

              <Dropdown
                label="Attack Surface"
                styleType="none"
                endIcon={
                  <div className="flex flex-row items-center justify-center">
                    {asmPages.includes(currentPage ?? '') && (
                      <div className=" ml-1 rounded-md border border-gray-400 px-2 py-1 text-xs capitalize text-gray-400">
                        {currentPage}
                      </div>
                    )}
                    <ChevronDownIcon className="size-4 text-gray-400" />
                  </div>
                }
                menu={{
                  className: 'w-96',
                  items: [
                    {
                      label: 'Assets',
                      description:
                        'Track discovered assets to ensure thorough security scans and risk assessment.',
                      helpText: <Shortcuts value="A" />,
                      icon: (
                        <div>
                          <AssetsIcon className="-ml-2 size-7 stroke-1 text-default-light" />
                        </div>
                      ),
                      to: getRoute(['app', 'assets']),
                    },
                    {
                      label: 'Risks',
                      description:
                        'Identify and prioritize risks in assets to protect your organization.',
                      helpText: <Shortcuts value="R" />,
                      icon: (
                        <div>
                          <RisksIcon className="-ml-2 size-7 stroke-1 text-default-light" />
                        </div>
                      ),
                      to: getRoute(['app', 'risks']),
                    },
                  ],
                }}
              />
            </nav>

            <div className="ml-auto flex items-center space-x-4">
              <Hexagon notify={showNotification}>
                <Notifications
                  onNotify={shouldShow => {
                    setShowNotification(shouldShow);
                  }}
                  onClick={() => setShowNotification(false)}
                />
              </Hexagon>
              <AccountDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="font-default flex flex-row space-x-2 border-t border-gray-600 pb-2 pt-4 text-lg font-light text-gray-400">
        <div>{icons[currentPage as keyof typeof icons]}</div>
        <p>
          {currentPage &&
            Object.keys(subtitles).includes(currentPage) &&
            subtitles[currentPage as keyof typeof subtitles]}
        </p>
      </div>
    </div>
  );
}
