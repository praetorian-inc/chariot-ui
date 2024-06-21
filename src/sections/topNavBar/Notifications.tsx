import React, { useEffect } from 'react';

import { Dropdown } from '@/components/Dropdown';
import { useMy } from '@/hooks/useMy';
import { JobStatus } from '@/types';
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
      className="p-2"
      startIcon={
        <span className="relative inline-flex">
          <button
            type="button"
            className="inline-flex items-center  text-sm font-semibold leading-6 text-white transition duration-150 ease-in-out"
            onClick={onClick}
          >
            {isPending ? '' : runningJobs}
          </button>
        </span>
      }
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
          {
            className: 'flex items-center',
            label: 'Queued',
            labelSuffix: queuedJobs?.toLocaleString(),
            to: `/app/jobs?status=${JobStatus.Queued}`,
          },
          {
            label: 'Running',
            labelSuffix: runningJobs?.toLocaleString(),
            className: 'flex items-center',
            to: `/app/jobs?status=${JobStatus.Running}`,
          },
        ],
      }}
    />
  );
};

export default Notifications;
