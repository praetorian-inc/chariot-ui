import React, { useEffect } from 'react';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { formatAlertCount } from '@/components/MyInbox';
import { useMy } from '@/hooks/useMy';
import { JobStatus } from '@/types';
import { cn } from '@/utils/classname';
import { sToMs } from '@/utils/date.util';
import { getRoute } from '@/utils/route.util';
import { StorageKey, useStorage } from '@/utils/storage/useStorage.util';

interface Props {
  onNotify?: (showNotification: boolean) => void;
  onClick?: () => void;
}

export const Notifications: React.FC<Props> = ({ onNotify, onClick }) => {
  const { data: jobs = [], isPending } = useMy(
    {
      resource: 'job',
    },
    {
      refetchInterval: sToMs(10),
    }
  );

  const [prevRunningJobs, setPrevRunningJobs] = useStorage<undefined | number>(
    { key: StorageKey.RUNNING_JOBS },
    undefined
  );

  const runningJobs = jobs.filter(
    job => job.status === JobStatus.Running
  ).length;
  const queuedJobs = jobs.filter(job => job.status === JobStatus.Queued).length;
  const failedJobs = jobs.filter(job => job.status === JobStatus.Fail).length;
  const completedJobs = jobs.filter(
    job => job.status === JobStatus.Pass
  ).length;

  useEffect(() => {
    if (runningJobs !== prevRunningJobs) {
      setPrevRunningJobs(runningJobs);
      onNotify && onNotify(true);
    }
  }, [isPending, runningJobs, prevRunningJobs]);

  return (
    <Dropdown
      className="h-7 border-r border-dashed border-gray-700 p-2"
      styleType="none"
      menu={{
        width: 300,
        items: [
          {
            label: (
              <span>
                All Jobs{' '}
                <span className="ml-2 rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                  Last 24 hours
                </span>
              </span>
            ),
            labelSuffix: jobs.length.toLocaleString(),
            className: 'flex items-center',
            to: getRoute(['app', 'jobs']),
          },
          {
            label: 'Divider',
            type: 'divider',
          },
          {
            label: 'Running',
            labelSuffix: runningJobs?.toLocaleString(),
            className: 'flex items-center',
            to: `/app/jobs?status=${JobStatus.Running}`,
          },
          {
            className: 'flex items-center',
            label: 'Queued',
            labelSuffix: queuedJobs?.toLocaleString(),
            to: `/app/jobs?status=${JobStatus.Queued}`,
          },
          {
            label: 'Failed',
            labelSuffix: failedJobs?.toLocaleString(),
            className: 'flex items-center',
            to: `/app/jobs?status=${JobStatus.Fail}`,
          },
          {
            className: 'flex items-center',
            label: 'Completed',
            labelSuffix: completedJobs?.toLocaleString(),
            to: `/app/jobs?status=${JobStatus.Pass}`,
          },
        ],
      }}
    >
      <span className="relative hidden items-center space-x-2 md:inline-flex">
        <span className="text-nowrap text-xs">Running:</span>
        <div
          className={cn(
            'inline-flex items-center  text-sm font-semibold leading-6 transition duration-150 ease-in-out',
            runningJobs === 0 ? 'text-gray-500' : 'text-white'
          )}
          onClick={onClick}
        >
          {isPending ? '' : runningJobs}
        </div>
      </span>
      <span
        className="relative inline-flex items-center space-x-2 md:hidden"
        onClick={onClick}
      >
        <ArrowPathRoundedSquareIcon className="mr-1 size-6 stroke-1 text-white" />
        {runningJobs > 0 && (
          <span
            role="label"
            className={cn(
              'text-white bg-red-500 rounded-full absolute flex justify-center items-center text-xs text-center font-semibold transition duration-150 ease-in-out',
              runningJobs > 99
                ? 'text-[10px] w-7 h-7 -top-3 -right-2'
                : 'w-5 h-5 -top-2 -right-1'
            )}
          >
            {formatAlertCount(runningJobs)}
          </span>
        )}
      </span>
    </Dropdown>
  );
};

export default Notifications;
