import { useState } from 'react';
import { AxiosHeaders } from 'axios';

import { mapAssetStataus } from '@/hooks/useAssets';
import { useAxios } from '@/hooks/useAxios';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { useAuth } from '@/state/auth';
import { useSearchContext } from '@/state/search';
import { Asset, MyResource, MyResourceKey } from '@/types';
import { UseExtendInfiniteQueryOptions, useInfiniteQuery } from '@/utils/api';

interface UseMyProps<ResourceKey extends MyResourceKey> {
  resource: ResourceKey;
  // query to filter the resource data, if not provided, it will fetch all data
  query?: string;
  // Resource data will be filtered by global search or filter from url parameters
  filterByGlobalSearch?: boolean;
}

export const useMy = <ResourceKey extends MyResourceKey>(
  props: UseMyProps<ResourceKey>,
  options?: UseExtendInfiniteQueryOptions<MyResource[ResourceKey]> & {
    doNotImpersonate?: boolean;
  }
) => {
  const { isImpersonating } = useAuth();
  const axios = useAxios();
  const { hashSearchFromQuery, genericSearchFromQuery } = useSearchContext();

  const [offset, setOffset] = useState<string | undefined>(undefined);

  let key = '';
  let compositeKey = '';

  if (props.filterByGlobalSearch) {
    if (genericSearchFromQuery) {
      // Resource data will be filtered by url parameter
      key = genericSearchFromQuery;
      compositeKey = genericSearchFromQuery;
    } else {
      // Resource data will be filtered by global search
      key = `#${props.resource}${hashSearchFromQuery}`;
      compositeKey = hashSearchFromQuery;
    }
  } else {
    if (props.query) {
      // Resource data will be filtered by query, ex: #seed#<dns>
      key = `#${props.resource}${props.query}`;
      compositeKey = props.query;
    } else {
      // This will fetch unfiltered resource data upto pagination limit
      key = `#${props.resource}`;
    }
  }

  const queryKey = getQueryKey.getMy(
    props.resource,
    `${compositeKey}${isImpersonating && options?.doNotImpersonate ? '.notImpersonating' : ''}`
  );
  const response = useInfiniteQuery<MyResource[ResourceKey], Error>({
    ...options,
    defaultErrorMessage: `Failed to fetch ${props.resource} data`,
    retry: false,
    queryKey,
    queryFn: async ({ pageParam }) => {
      const { data } = await axios.get(`/my`, {
        params: {
          key,
          offset: pageParam,
        },
        headers: options?.doNotImpersonate
          ? ({
              common: {
                account: undefined,
              },
            } as unknown as AxiosHeaders)
          : undefined,
      });
      setOffset(data?.offset);

      const resourceData = data[`${props.resource}s`] || [];

      if (props.resource === 'asset') {
        return resourceData.map((asset: Asset) => {
          return {
            ...asset,
            status: mapAssetStataus(asset),
          };
        });
      }

      return resourceData;
    },
    initialPageParam: undefined,
    getNextPageParam: () => (offset ? JSON.stringify(offset) : undefined),
  });

  const processedData = response.data ? response.data.pages.flat() : [];

  return {
    ...response,
    data: processedData,
    fetchNextPage: offset ? response.fetchNextPage : undefined,
  };
};
