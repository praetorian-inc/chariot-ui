import React, { useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { format } from 'date-fns';

import { Dropdown } from '@/components/Dropdown';
import SourceDropdown from '@/components/SourceDropdown';
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
  const [sources, setSources] = useFilter([''], 'job-sources');
  const [searchParams, setSearchParams] = useSearchParams();

  const filteredJobs: Job[] = useMemo(() => {
    let filteredJobs = jobs;

    if (filter?.length > 0) {
      filteredJobs = jobs.filter(job => job.status === filter);
    }

    if (sources.filter(Boolean).length > 0) {
      filteredJobs = jobs.filter(job => sources.includes(job.source));
    }

    return filteredJobs;
  }, [filter, sources, JSON.stringify(jobs)]);

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
        <span>{parts[0]}</span>
        <span>@</span>
        <span>{parts[1]}</span>
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
      label: 'Job',
      id: 'source',
      fixedWidth: 160,
    },
    {
      label: 'Source IP',
      id: 'name',
      cell: (job: Job) => {
        if (job.status === 'JQ') {
          return <span className="italic text-gray-500">Not started</span>;
        } else return job.name;
      },
    },
    {
      label: 'DNS',
      id: 'dns',
    },

    {
      label: 'Updated',
      id: 'updated',
      fixedWidth: 220,
      cell: (job: Job) => {
        return designedDate(formatDate(job.updated));
      },
    },
  ];

  return (
    <div className="flex w-full flex-col">
      <Table
        resize={true}
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
                      labelSuffix: stats.status?.[key]?.toLocaleString() || 0,
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
            <SourceDropdown
              type="job"
              onSelect={selectedRows => setSources(selectedRows)}
            />
          </div>
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
