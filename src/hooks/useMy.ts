import { useState } from 'react';

import { useSearchContext } from '@/state/search';
import { UseExtendInfiniteQueryOptions, useInfiniteQuery } from '@/utils/api';

import { Asset, MyResource, MyResourceKey } from '../types';

import { mapAssetStataus } from './useAssets';
import { useAxios } from './useAxios';
import { getQueryKey } from './useQueryKeys';
import { useSearchParams } from './useSearchParams';

interface UseMyProps<ResourceKey extends MyResourceKey> {
  resource: ResourceKey;
  // query to filter the resource data, if not provided, it will fetch all data
  query?: string;
  // Resource data will be filtered by global search or filter from url parameters
  filterByGlobalSearch?: boolean;
}

export const useMy = <ResourceKey extends MyResourceKey>(
  props: UseMyProps<ResourceKey>,
  options?: UseExtendInfiniteQueryOptions<MyResource[ResourceKey]>
) => {
  const axios = useAxios();
  const { searchParams } = useSearchParams();
  const { hashSearch } = useSearchContext();

  const [offset, setOffset] = useState<string | undefined>(undefined);

  let key = '';
  let compositeKey = '';

  if (props.filterByGlobalSearch) {
    const unparsedQ = searchParams.get('q');
    const q = unparsedQ && decodeURIComponent(unparsedQ);

    if (q) {
      // Resource data will be filtered by url parameter
      key = q;
      compositeKey = q;
    } else {
      // Resource data will be filtered by global search
      key = `#${props.resource}${hashSearch}`;
      compositeKey = hashSearch;
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

  const queryKey = getQueryKey.getMy(props.resource, compositeKey);
  const response = useInfiniteQuery<MyResource[ResourceKey], Error>({
    ...options,
    defaultErrorMessage: `Failed to fetch ${props.resource} data`,
    queryKey,
    queryFn: async ({ pageParam }) => {
      const { data } = await axios.get(`/my`, {
        params: {
          key,
          offset: pageParam,
        },
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
  };
};
