import React, { useEffect, useRef } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

import { Button } from '@/components/Button';

interface Props {
  open: boolean;
  currentPlan: 'freemium' | 'unmanaged' | 'managed';
  onClose: () => void;
}

const UpgradeMenu: React.FC<Props> = ({ open, currentPlan, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if ((event.target as HTMLElement).id !== 'upgrade-plan') {
          onClose();
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`absolute right-0 top-12 z-50 w-[500px] rounded-sm bg-gray-500 p-6 shadow-xl transition-all duration-200 ease-out${
        open
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'top-999999999999 left-99999999 pointer-events-none -translate-y-5 opacity-0'
      }`}
    >
      <div className="flex space-x-6">
        {/* Unmanaged Plan */}
        <div className="relative w-1/2 rounded-sm border border-gray-300 bg-gray-50 p-5 shadow-sm">
          <div className="absolute left-[-12px] top-[-12px] rounded-full bg-gray-700 px-3 py-1 text-xs text-white">
            Basic
          </div>
          <div className="mb-3 flex items-center space-x-2">
            <ShieldCheckIcon className="size-7 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Unmanaged</h3>
          </div>
          <p className="text-sm text-gray-600">
            Get started with up to 500 assets under our Unmanaged Plan. Enjoy
            full access to our powerful platform while in trial mode. For
            unlimited assets, consider upgrading to unlock the full potential.
          </p>
          {currentPlan === 'unmanaged' ? (
            <Button className="mt-11 w-full bg-brand text-white">
              Upgrade
            </Button>
          ) : (
            <Button className="mt-11 w-full bg-blue-600 text-white hover:bg-blue-700">
              Choose Plan
            </Button>
          )}
        </div>

        {/* Managed Plan */}
        <div className="relative flex w-1/2 flex-col rounded-sm  bg-gray-50 p-5 shadow-lg">
          <div className="absolute left-[-12px] top-[-12px] rounded-full bg-brand px-3 py-1 text-xs text-white">
            Best Value
          </div>
          <div className="mb-3 flex items-center space-x-2">
            <SparklesIcon className="size-7 text-default" />
            <h3 className="text-lg font-semibold text-default">Managed</h3>
          </div>
          <p className="flex-1 text-sm text-gray-700">
            Pinpoint and address your critical security risks with our MSP team,
            blending automation and human precision for top-priority
            remediation.
          </p>
          {currentPlan === 'managed' ? (
            <Button disabled className="mt-6 w-full bg-gray-300 text-gray-600">
              Already Selected
            </Button>
          ) : (
            <Button className="mt-6 w-full rounded-sm bg-brand font-semibold text-white">
              Free Trial Upgrade
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeMenu;
