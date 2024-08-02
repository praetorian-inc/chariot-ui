import { useAxios } from '@/hooks/useAxios';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { useAuth } from '@/state/auth';
import { UseExtendQueryOptions, useQuery } from '@/utils/api';

export interface Alert {
  priority: string;
  label: string;
  count: number;
  query: string;
}

export function useGetAccountAlerts(options?: UseExtendQueryOptions<Alert[]>) {
  const { friend, me } = useAuth();
  const axios = useAxios();

  return useQuery<Alert[]>({
    ...options,
    defaultErrorMessage: 'Failed to fetch account alerts',
    queryKey: getQueryKey.getAccountAlerts(friend || me),
    queryFn: async () => {
      const res = await axios.get(`/account/alert`);
      return res.data;
    },
  });
}
