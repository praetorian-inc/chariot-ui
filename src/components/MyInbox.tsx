import React, { useEffect } from 'react';
import { Inbox } from 'lucide-react';

import { Dropdown } from '@/components/Dropdown';
import { useGetAccountAlerts } from '@/hooks/useGetAccountAlerts';
import { cn } from '@/utils/classname';
import { sToMs } from '@/utils/date.util';
import { getRoute } from '@/utils/route.util';
import { StorageKey, useStorage } from '@/utils/storage/useStorage.util';

const MyInbox: React.FC = () => {
  const { data: alerts = [], isPending } = useGetAccountAlerts({
    refetchInterval: sToMs(10),
  });

  const [prevAlertCount, setPrevAlertCount] = useStorage<undefined | number>(
    { key: StorageKey.ALERT_COUNT },
    undefined
  );

  const totalAlerts =
    (alerts || []).reduce((acc, alert) => acc + alert.count, 0) ?? 0;

  useEffect(() => {
    if (totalAlerts !== prevAlertCount) {
      setPrevAlertCount(totalAlerts);
    }
  }, [isPending, totalAlerts, prevAlertCount]);

  const formatAlertCount = (count: number) => {
    if (count > 999) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count;
  };

  const getMenuItems = () => {
    if (alerts === null || alerts.length === 0) {
      return [
        {
          label: 'No alerts found',
          className: 'flex items-center text-gray-500 italic',
          to: getRoute(['app', 'alerts']),
        },
      ];
    } else {
      return [
        {
          label: 'All Alerts',
          labelSuffix: totalAlerts.toLocaleString(),
          className: 'flex items-center',
          to: getRoute(['app', 'alerts']),
        },
        {
          label: 'Divider',
          type: 'divider' as const,
        },
        ...alerts.map(alert => ({
          label: alert.label,
          labelSuffix: alert.count.toLocaleString(),
          className: 'flex items-center',
          to: `/app/alerts?query=${alert.query}`,
        })),
      ];
    }
  };

  return (
    <Dropdown
      className="h-7 border-r border-dashed border-gray-700 p-2"
      startIcon={
        <span className="relative inline-flex items-center space-x-2">
          <Inbox className="mr-1 size-6 stroke-1 text-white" />
          {totalAlerts > 0 && (
            <span
              role="label"
              className={cn(
                'text-white bg-red-500 rounded-full absolute flex justify-center items-center text-xs text-center font-semibold transition duration-150 ease-in-out',
                totalAlerts > 99
                  ? 'text-[10px] w-7 h-7 -top-3 -right-2'
                  : 'w-5 h-5 -top-2 -right-1'
              )}
            >
              {formatAlertCount(totalAlerts)}
            </span>
          )}
        </span>
      }
      styleType="none"
      menu={{
        items: getMenuItems(),
      }}
    />
  );
};

export default MyInbox;
