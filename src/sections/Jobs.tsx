import React, { useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { format } from 'date-fns';

import { Dropdown } from '@/components/Dropdown';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { useMy } from '@/hooks';
import { useCounts } from '@/hooks/useCounts';
import { useFilter } from '@/hooks/useFilter';
import { Job, JobLabels, JobStatus } from '@/types';

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

const Jobs: React.FC = () => {
  const location = useLocation();

  const { data: stats = {} } = useCounts({
    resource: 'job',
    filterByGlobalSearch: true,
  });
  const {
    data: jobs = [],
    refetch,
    error,
    status,
    isFetchingNextPage,
    fetchNextPage,
  } = useMy({
    resource: 'job',
    filterByGlobalSearch: true,
  });

  const [filter, setFilter] = useFilter('', 'job-status');
  const [searchParams, setSearchParams] = useSearchParams();

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
  }, [location.search]);

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

  const columns: Columns<Job> = [
    {
      label: 'Status',
      id: 'status',
      cell: (job: Job) => {
        return (
          <Tooltip title={job.comment}>
            <div
              className={`flex w-[100px] justify-center rounded-l-[2px] px-4 py-1.5 ${getStatusColor(job.status)}`}
            >
              {getStatusText(job.status)}
            </div>
          </Tooltip>
        );
      },
      fixedWidth: 120,
    },
    {
      label: 'Name',
      id: 'name',
      cell: (job: Job) => {
        return (
          <div className="flex">
            {job.status === 'JQ' ? (
              <div className="w-4" />
            ) : (
              <>
                <div className="hidden shrink-0 items-center lg:flex">
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
          </div>
        );
      },
    },
    {
      label: 'Updated',
      id: 'updated',
      fixedWidth: 220,
      cell: (job: Job) => {
        return (
          <div className="mr-4">
            <span className="hidden md:inline">on</span>
            <span className="mx-1 ">
              {designedDate(formatDate(job.updated))}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex w-full flex-col">
      <Table
        resize={true}
        filters={
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
              onClick: value => {
                if (value === '' || !value) {
                  searchParams.delete('status');
                } else {
                  searchParams.set('status', value ?? '');
                }
                setSearchParams(searchParams);
                setFilter(value || '');
              },
              value: filter,
            }}
          />
        }
        columns={columns}
        data={filteredJobs}
        error={error}
        status={status}
        name="seeds"
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        noData={{
          title: 'No Jobs Found',
          description: (
            <p>
              There are no current jobs running. Click on Scan now button under
              Risk drawer to trigger new jobs
            </p>
          ),
        }}
      />
    </div>
  );
};

export default Jobs;
