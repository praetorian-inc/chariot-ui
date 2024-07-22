import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Hexagon } from '@/components/Hexagon';
import { LogoIcon } from '@/components/icons/Logo.icon';
import { AccountDropdown } from '@/sections/topNavBar/AccountDropdown';
import { Notifications } from '@/sections/topNavBar/Notifications';
import { getRoute } from '@/utils/route.util';

export function TopNavBar() {
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = location.pathname.split('/').pop();
  const isCurrentPage = (page: string) => currentPage === page;

  return (
    <div>
      <div className="flex flex-col items-center justify-between py-3 md:flex-row">
        <div className="flex w-full items-center">
          <div className="flex w-full flex-nowrap items-center">
            <Link to={getRoute(['app', 'risks'])}>
              <LogoIcon className="mr-4 size-9" />
            </Link>
            <nav className="flex w-full items-center space-x-6">
              <button
                onClick={() => navigate(getRoute(['app', 'overview']))}
                className={`hover:border-header-default mt-1 border-b-2 pb-1 text-sm font-medium transition-colors  hover:text-gray-100 ${
                  isCurrentPage('overview')
                    ? 'border-layer0'
                    : 'border-transparent'
                }`}
              >
                Overview
              </button>
              <Link
                to={getRoute(['app', 'assets'])}
                className={`hover:border-header-default mt-1 border-b-2 pb-1 text-sm font-medium transition-colors  hover:text-gray-100 ${
                  isCurrentPage('assets')
                    ? 'border-layer0'
                    : 'border-transparent'
                }`}
              >
                Assets
              </Link>
              <Link
                to={getRoute(['app', 'risks'])}
                className={`hover:border-header-default mt-1 border-b-2 pb-1 text-sm font-medium transition-colors  hover:text-gray-100 ${
                  isCurrentPage('risks')
                    ? 'border-layer0'
                    : 'border-transparent'
                }`}
              >
                Risks
              </Link>
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
    </div>
  );
}
