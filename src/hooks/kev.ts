// eslint-disable-next-line no-restricted-imports
import { useQueries } from '@tanstack/react-query';

import { useAxios } from '@/hooks/useAxios';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { getQueryKey } from '@/hooks/useQueryKeys';
import {
  mergeStatus,
  UseExtendQueryOptions,
  useMergeStatus,
} from '@/utils/api';

export function useGetKev(options?: UseExtendQueryOptions<string[]>) {
  const axios = useAxios();

  const { data: genericSearch, status: genericSearchStatus } = useGenericSearch(
    {
      query: 'class:cti',
    },
    { enabled: options?.enabled }
  );

  const { data: KEV, status: KEVStatus } = useQueries({
    queries:
      genericSearch?.files?.map(file => {
        return {
          queryKey: getQueryKey.getFile({ name: file.name }),
          queryFn: async () => {
            const res = await axios.get(`/file`, {
              params: {
                name: file.name,
              },
            });

            return res.data as string[];
          },
        };
      }) || [],
    combine: results => {
      return {
        data: results.filter(x => x).flatMap(result => result.data) as string[],
        status: mergeStatus(...results.map(result => result.status)),
      };
    },
  });

  return {
    data: KEV,
    status: useMergeStatus(genericSearchStatus, KEVStatus),
  };
}
