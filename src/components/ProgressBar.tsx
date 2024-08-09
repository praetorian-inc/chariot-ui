import { useState } from 'react';

import { Button } from '@/components/Button';
import UpgradeMenu from '@/components/UpgradeMenu';
import { cn } from '@/utils/classname';

const ProgressBar: React.FC<{
  used: number;
  total: number;
  plan: string;
  upgradeLink: string;
}> = ({ used, total, plan }) => {
  const [isUpgradePlanOpen, setIsUpgradePlanOpen] = useState(false);
  const percentageUsed = Math.min((used / total) * 100, 100);

  return (
    <div className="mb-6 rounded-lg bg-gray-800 p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xl font-semibold text-white">
          {`Plan: ${plan} - Used ${used?.toLocaleString()} of ${total?.toLocaleString()} available assets`}
        </p>
        <div className="relative">
          <Button
            id="upgrade-plan"
            styleType="primaryLight"
            className="text-md font-bold"
            onClick={() => {
              setIsUpgradePlanOpen(v => !v);
            }}
          >
            Upgrade Plan
          </Button>
          <UpgradeMenu
            open={isUpgradePlanOpen}
            onClose={() => setIsUpgradePlanOpen(false)}
            currentPlan="unmanaged"
          />
        </div>
      </div>
      <div className="h-5 w-full justify-center overflow-hidden rounded-full bg-gray-700">
        <div
          className={cn(
            'flex  items-center h-full justify-center text-center text-xs text-white leading-none rounded-full',
            percentageUsed < 70
              ? 'bg-green-500'
              : percentageUsed < 90
                ? 'bg-yellow-500'
                : 'bg-red-500'
          )}
          style={{ width: `${percentageUsed}%` }}
        >
          <p className="font-semibold">{percentageUsed.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
