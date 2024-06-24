import React, { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';

import { Dropdown } from '@/components/Dropdown';
import { Loader } from '@/components/Loader';
import { TableFilters } from '@/components/table/TableFilters';
import { Body } from '@/components/ui/Body';
import { FilterCounts } from '@/components/ui/FilterCounts';
import { useMy } from '@/hooks';
import { useCounts } from '@/hooks/useCounts';
import { useFilter } from '@/hooks/useFilter';
import { Job, JobLabels, JobStatus } from '@/types';
import { useMergeStatus } from '@/utils/api';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "MMM d, yyyy '@' h:mm a");
};

export const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.Pass:
      return 'bg-emerald-100 text-emerald-800 inline';
    case JobStatus.Fail:
      return 'bg-red-100 text-red-800 inline';
    case JobStatus.Queued:
      return 'bg-gray-200 text-gray-800 inline';
    case JobStatus.Running:
    default:
      return 'bg-indigo-100 text-indigo-800 inline';
  }
};

const ROW_HEIGHT = 44;
const EMPTY_ROWS_COUNT = 25;
const ROW_SPACING = 12;

const getStatusText = (status: JobStatus) => {
  const classes = 'px-1 text-xs leading-5 font-medium rounded-full text-center';
  switch (status) {
    case JobStatus.Pass:
      return <span className={classes}>Completed</span>;
    case JobStatus.Fail:
      return <span className={classes}>Failed</span>;
    case JobStatus.Queued:
      return <span className={classes}>Queued</span>;
    case JobStatus.Running:
    default:
      return <span className={classes}>Running</span>;
  }
};

const JobsTable: React.FC = () => {
  const location = useLocation();

  const { data: stats = {}, status: statsStatus } = useCounts({
    resource: 'job',
    filterByGlobalSearch: true,
  });
  const {
    data: jobs = [],
    refetch,
    status: jobStatus,
  } = useMy({
    resource: 'job',
    filterByGlobalSearch: true,
  });

  const status = useMergeStatus(statsStatus, jobStatus);

  const searchParams = new URLSearchParams(location.search);
  const initialFilter = searchParams.get('status') || '';

  const [filter, setFilter] = useFilter(initialFilter);
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredJobs: Job[] = useMemo(() => {
    if (filter?.length > 0) {
      const filtered = jobs.filter(job => job.status === filter);
      return filtered?.length > 0 ? filtered : [];
    }
    return jobs;
  }, [filter, JSON.stringify(jobs)]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newFilter = searchParams.get('status') || '';
    setFilter(newFilter);
  }, [location.search, setFilter]);

  const virtualizer = useVirtualizer({
    count: status === 'pending' ? EMPTY_ROWS_COUNT : filteredJobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  const designedDate = (date: string) => {
    const parts = date.split('@');
    return (
      <p className="inline">
        <span className="font-semibold">{parts[0]}</span>
        <span>@</span>
        <span className="font-semibold">{parts[1]}</span>
      </p>
    );
  };

  if (status === 'pending') {
    return (
      <Body>
        {[...Array(EMPTY_ROWS_COUNT).keys()].map(item => (
          <div className="bg-layer0" key={`loader-${item}`}>
            <Loader className="mb-2 h-12" isLoading={true} />
          </div>
        ))}
      </Body>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <Body ref={parentRef}>
        {/* <Counts
          stats={stats}
          onClick={(label: string) => {
            if (label === filter && label !== '') {
              setFilter('');
            } else {
              setFilter(label);
            }
          }}
          selected={filter}
          type="jobs"
        /> */}
        <TableFilters
          filters={
            <div className="flex gap-4">
              <Dropdown
                styleType="header"
                label={filter ? `${JobLabels[filter]} Jobs` : 'All Jobs'}
                endIcon={
                  <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
                }
                menu={{
                  items: [
                    {
                      label: 'All Jobs',
                      labelSuffix: jobs.length?.toLocaleString(),
                      value: '',
                    },
                    {
                      label: 'Divider',
                      type: 'divider',
                    },
                    ...Object.entries(JobLabels).map(([key, label]) => {
                      return {
                        label,
                        labelSuffix: stats[key]?.toLocaleString() || 0,
                        value: key,
                      };
                    }),
                  ],
                  onClick: value => setFilter(value || ''),
                  value: filter,
                }}
              />
              <FilterCounts count={filteredJobs.length} type="Jobs" />
            </div>
          }
        />

        <div
          style={{
            height: `${virtualizer.getTotalSize() + items.length * ROW_SPACING}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {status === 'success' &&
            items.map((virtualItem, index) => {
              if (virtualItem.index >= filteredJobs.length) {
                return null;
              }
              const job = filteredJobs[virtualItem.index];

              return (
                <div
                  key={job.key}
                  className="flex items-center rounded-[2px] bg-layer0 text-sm shadow"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start + index * ROW_SPACING}px)`,
                  }}
                >
                  <div
                    className={`flex w-[100px] rounded-l-[2px] px-4 py-3 ${getStatusColor(job.status)}`}
                  >
                    {getStatusText(job.status)}
                  </div>
                  {job.status === 'JQ' ? (
                    <div className="w-4" />
                  ) : (
                    <>
                      <div className="ml-4 hidden shrink-0 items-center lg:flex">
                        <span className="mr-1 font-semibold">Praetorian</span>
                        <span className="hidden md:inline">({job.name})</span>
                      </div>
                      <span className="mx-1 hidden lg:block">to</span>
                    </>
                  )}
                  <div className="ml-4 flex flex-1 items-center lg:ml-0">
                    <span className="mr-1 font-semibold">{job.dns}</span>
                    <span className="hidden sm:inline">
                      ({job.key.split('#')[4]})
                    </span>
                  </div>

                  <div className="mr-4">
                    <span className="hidden md:inline">on</span>
                    <span className="mx-1 ">
                      {designedDate(formatDate(job.updated))}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </Body>
    </div>
  );
};

export default JobsTable;
