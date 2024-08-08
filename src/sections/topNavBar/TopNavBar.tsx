import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { LogoIcon } from '@/components/icons/Logo.icon';
import MyInbox from '@/components/MyInbox';
import { AccountDropdown } from '@/sections/topNavBar/AccountDropdown';
import { Notifications } from '@/sections/topNavBar/Notifications';
import { getRoute } from '@/utils/route.util';

export const TopNavBar: React.FC = () => {
  const [, setShowNotification] = useState<boolean>(false);
  const location = useLocation();

  const currentPage = location.pathname.split('/').pop();
  const isCurrentPage = (page: string) => currentPage === page;
  const linkSize = 'w-15 md:w-20';

  const links = ['overview', 'assets', 'risks'];
  return (
    <div>
      <div className="flex flex-col items-center justify-between py-3 md:flex-row">
        <div className="flex w-full items-center">
          <div className="flex w-full flex-nowrap items-center">
            <Link to={getRoute(['app', 'overview'])}>
              <LogoIcon className="mr-4 size-9" />
            </Link>

            <nav className="flex w-full items-center space-x-6 text-center">
              {links.map(link => (
                <Link
                  key={link}
                  to={getRoute([
                    'app',
                    link as 'overview' | 'assets' | 'risks',
                  ])}
                  className={`${linkSize} mt-1 border-b-2 pb-1 text-sm font-medium capitalize transition-colors 
                  hover:text-gray-100 ${
                    isCurrentPage(link)
                      ? 'border-layer0 hover:border-layer0'
                      : 'border-transparent hover:border-header'
                  }`}
                >
                  {link}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center md:space-x-4">
              <Notifications
                onNotify={shouldShow => {
                  setShowNotification(shouldShow);
                }}
                onClick={() => setShowNotification(false)}
              />
              <MyInbox />
              <AccountDropdown />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
