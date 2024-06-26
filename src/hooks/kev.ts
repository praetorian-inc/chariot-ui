import { AxiosHeaders } from 'axios';

import { useAxios } from '@/hooks/useAxios';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { useMergeStatus, useQuery } from '@/utils/api';

export function useGetKev() {
  const axios = useAxios();

  const { data: genericSearch, status: genericSearchStatus } = useGenericSearch(
    {
      query: 'class:cti',
    }
  );

  const { data: KEV, status: KEVStatus } = useQuery<string[]>({
    defaultErrorMessage: 'Failed to fetch kev',
    queryKey: getQueryKey.getKev(),
    queryFn: async () => {
      if (genericSearch?.files?.length) {
        const asyncRes = genericSearch.files.map(file => {
          return axios.get(`/file`, {
            params: {
              name: file.name,
            },
            responseType: 'text',
            headers: {
              common: {
                account: undefined,
              },
            } as unknown as AxiosHeaders,
          });
        });

        const res = await Promise.all(asyncRes);

        return res.flatMap(r => JSON.parse(r.data));
      }

      return [];
    },
    enabled: Boolean(genericSearch?.files?.length),
  });

  return { data: KEV, status: useMergeStatus(genericSearchStatus, KEVStatus) };
}
