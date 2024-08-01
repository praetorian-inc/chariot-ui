import { toast } from 'sonner';

import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { useMutation } from '@/utils/api';

export const useUpgrade = () => {
  const axios = useAxios();

  const { invalidate } = useMy({ resource: 'account' }, { enabled: false });

  return useMutation({
    defaultErrorMessage: 'Failed to upgrade account',
    mutationFn: () => {
      return axios.post('upgrade');
    },
    onSuccess: () => {
      toast.success('Account Upgraded');
      invalidate();
    },
  });
};
