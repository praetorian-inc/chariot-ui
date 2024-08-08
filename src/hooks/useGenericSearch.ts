import { mapAssetStataus } from '@/hooks/useAssets';
import { useAxios } from '@/hooks/useAxios';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { GenericResource } from '@/types';
import { UseExtendQueryOptions, useQuery } from '@/utils/api';

export const useGenericSearch = (
  props: { query: string; exact?: boolean },
  options?: UseExtendQueryOptions<GenericResource>
) => {
  const { query, exact } = props;

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
          exact: exact,
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
