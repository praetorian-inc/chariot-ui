import { useSearchContext } from '@/state/search';
import { UseExtendQueryOptions, useQuery } from '@/utils/api';
import { sToMs } from '@/utils/date.util';

import { MyResourceKey, Statistics } from '../types';

import { useAxios } from './useAxios';
import { getQueryKey } from './useQueryKeys';
import { useSearchParams } from './useSearchParams';

interface UseCountsProps<ResourceKey extends MyResourceKey> {
  resource: ResourceKey;
  // query to filter the resource data, if not provided, it will fetch all data
  query?: string;
  // Resource data will be filtered by global search or filter from url parameters
  filterByGlobalSearch?: boolean;
}

export const useCounts = <ResourceKey extends MyResourceKey>(
  props: UseCountsProps<ResourceKey>,
  options?: UseExtendQueryOptions<Statistics>
) => {
  const axios = useAxios();
  const { searchParams } = useSearchParams();
  const { hashSearch } = useSearchContext();

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

  const queryKey = getQueryKey.getCounts(props.resource, compositeKey);

  return useQuery<Statistics, Error>({
    ...options,
    defaultErrorMessage: `Failed to fetch ${props.resource} counts`,
    refetchInterval: sToMs(10),
    queryKey,
    queryFn: async () => {
      const { data } = await axios.get(`/my/count`, {
        params: {
          key,
        },
      });
      // remap empty key with 'cloud'
      if ('' in data) {
        data.cloud = data[''];
        delete data[''];
      }
      return data as Statistics;
    },
  });
};
