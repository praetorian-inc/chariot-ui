import { Snackbar } from '@/components/Snackbar';
import { useMutation } from '@/utils/api';

import { useAxios } from './useAxios';
import { useMy } from './useMy';

export function useReRunJob() {
  const axios = useAxios();

  const { invalidate: invalidateJobs } = useMy(
    { resource: 'job' },
    { enabled: false }
  );

  return useMutation({
    defaultErrorMessage: 'Failed to re run job',
    mutationFn: ({ capability, dns }: { capability: string; dns: string }) => {
      return axios.post(`/job/`, {
        name: capability,
        key: `#asset#${dns}`,
      });
    },
    onSuccess: () => {
      // Note: Need to be updated to show the correct message
      Snackbar({
        title: `Processing Scan Request`,
        description: '',
        variant: 'success',
      });

      invalidateJobs();
    },
  });
}
