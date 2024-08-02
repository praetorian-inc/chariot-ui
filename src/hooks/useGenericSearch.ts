import { mapAssetStataus } from '@/hooks/useAssets';
import { useAxios } from '@/hooks/useAxios';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { GenericResource } from '@/types';
import { UseExtendQueryOptions, useQuery } from '@/utils/api';

export const useGenericSearch = (
  props: { query: string; equal?: boolean },
  options?: UseExtendQueryOptions<GenericResource>
) => {
  const { query, equal } = props;

  const axios = useAxios();
  return useQuery<GenericResource>({
    ...options,
    defaultErrorMessage: `Failed to fetch search result`,
    queryKey: getQueryKey.genericSearch(query),
    enabled: options?.enabled ?? Boolean(query),
    queryFn: async () => {
      const { data } = await axios.get<GenericResource>(`/my`, {
        params: {
          key: query,
          equal: equal,
        },
      });

      if (data.assets) {
        return {
          ...data,
          assets: data.assets.map(asset => {
            return {
              ...asset,
              status: mapAssetStataus(asset),
            };
          }),
        };
      }

      return data;
    },
  });
};
