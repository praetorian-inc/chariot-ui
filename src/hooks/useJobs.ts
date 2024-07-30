import { toast } from 'sonner';

import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { useMutation } from '@/utils/api';

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
    mutationFn: async (jobs: { capability: string; dns: string }[]) => {
      const promises = jobs
        .map(async ({ capability, dns }) => {
          const { data } = await axios.post(`/job/`, {
            name: capability,
            key: `#asset#${dns}`,
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
