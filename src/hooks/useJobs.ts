import { useMemo } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useQueries } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { Job, JobStatus } from '@/types';
import {
  mergeJobStatus,
  mergeStatus,
  UseExtendQueryOptions,
  useMutation,
} from '@/utils/api';
import { formatDate } from '@/utils/date.util';

export function useReRunJob() {
  const axios = useAxios();

  const { invalidate: invalidateJobs } = useMy(
    { resource: 'job' },
    { enabled: false }
  );

  return useMutation({
    defaultErrorMessage: 'Failed to re run job',
    mutationFn: ({
      capability,
      dns,
      jobKey,
    }: {
      capability: string;
      dns?: string;
      jobKey?: string;
    }) => {
      return axios.post(`/job/`, {
        name: capability,
        key: jobKey || `#asset#${dns}`,
      });
    },
    onSuccess: () => {
      // Note: Need to be updated to show the correct message
      toast.success(`Processing Scan Request`);

      invalidateJobs();
    },
  });
}

export function useBulkReRunJob() {
  const axios = useAxios();

  const { invalidate: invalidateJobs } = useMy(
    { resource: 'job' },
    { enabled: false }
  );

  return useMutation({
    defaultErrorMessage: 'Failed to re run job',
    mutationFn: async (
      jobs: { capability: string; dns?: string; jobKey?: string }[]
    ) => {
      const promises = jobs
        .map(async ({ capability, dns, jobKey }) => {
          const { data } = await axios.post(`/job/`, {
            name: capability,
            key: jobKey || `#asset#${dns}`,
          });

          return data;
        })
        .map(promise => promise.catch(error => error));

      const response = await Promise.all(promises);

      const validResults = response.filter(
        result => !(result instanceof Error)
      );

      if (validResults.length > 0) {
        toast.success(`Processing Scan Request`);

        invalidateJobs();
      }

      return response;
    },
  });
}

export const useJobsStatus = (
  jobKeys: string[],
  options?: UseExtendQueryOptions<Job>
) => {
  const axios = useAxios();
  return useQueries({
    queries: jobKeys
      .filter(x => Boolean(x))
      .map(key => {
        return {
          ...options,
          queryKey: getQueryKey.getMy('job', key),
          queryFn: async () => {
            const res = await axios.get(`/my`, {
              params: {
                key: `#job#${key}`,
              },
            });

            return res.data.jobs[0] as Job;
          },
        };
      }),
    combine: results => {
      return {
        data: mergeJobStatus(results.map(result => result.data?.status) || []),
        status: mergeStatus(...results.map(result => result.status)),
      };
    },
  });
};

const getJobTimeline = ({
  status,
  updated = '',
}: {
  status?: JobStatus;
  updated?: string;
}) => {
  const description = `Last Checked: ${formatDate(updated)}`;
  return [
    {
      title: 'Idle',
      status: '',
    },
    {
      title: 'Queued',
      status: JobStatus.Queued,
    },
    {
      title: 'Scanning',
      status: JobStatus.Running,
    },
    ...(status === JobStatus.Fail
      ? [
          {
            title: 'Failed',
            status: JobStatus.Fail,
            className: 'bg-error',
          },
        ]
      : [
          {
            title: 'Completed',
            status: JobStatus.Pass,
          },
        ]),
  ].map(current => ({
    ...current,
    description: current.status === status ? description : '',
  }));
};

export const useJobsTimeline = ({
  allAssetJobs,
  source,
}: {
  allAssetJobs: Job[];
  source: string;
}) => {
  const jobs = allAssetJobs.filter(job => {
    return job.source === source;
  });

  const jobsStatus: JobStatus | undefined = useMemo(
    () => mergeJobStatus(jobs.map(job => job.status)),
    [jobs]
  );

  const jobsTimeline = useMemo(() => {
    return getJobTimeline({
      status: jobsStatus,
      updated:
        jobs
          .map(job => job.updated)
          .sort()
          .reverse()[0] || '',
    });
  }, [jobsStatus, jobs]);

  return {
    jobsTimeline,
    jobsStatus,
    isJobsRunning:
      jobsStatus === JobStatus.Running || jobsStatus === JobStatus.Queued,
  };
};
