/* eslint-disable no-restricted-imports */
import { useMemo } from 'react';
import {
  DefaultError,
  InfiniteData,
  QueryFunction,
  QueryKey,
  QueryStatus,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery as useReactQueryInfinite,
  useMutation as useReactQueryMutation,
  UseMutationOptions,
  useQuery as useReactQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

export type { QueryStatus } from '@tanstack/react-query';
export { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/queryclient';
import { JobStatus } from '@/types';
import { createError } from '@/utils/error.util';
import { capitalize } from '@/utils/lodash.util';
import { appendPeriodIfMissing } from '@/utils/text.util';

export function useMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> &
    CustomOptions &
    Required<
      Pick<
        UseMutationOptions<TData, TError, TVariables, TContext>,
        'mutationFn'
      >
    >
) {
  return useReactQueryMutation({
    ...options,
    mutationFn: async (...args) => {
      try {
        return await options.mutationFn(...args);
      } catch (error) {
        throw getQueryError(options, error);
      }
    },
  });
}

export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> &
    CustomOptions & { queryFn: QueryFunction<TQueryFnData, TQueryKey, never> }
) {
  const query = useReactQuery({
    ...options,
    queryFn: async (...args) => {
      try {
        return await options.queryFn(...args);
      } catch (error) {
        throw getQueryError(options, error);
      }
    },
  });

  return {
    ...query,
    updateAllSubQueries: (data: (prevData: TData) => TData) => {
      updateAllQueryCache<TData>(options.queryKey, data);
    },
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  };
}

export function useInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UndefinedInitialDataInfiniteOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  > &
    CustomOptions & {
      queryFn: QueryFunction<TQueryFnData, TQueryKey, TPageParam>;
    }
) {
  const query = useReactQueryInfinite({
    ...options,
    queryFn: async (...args) => {
      try {
        return await options.queryFn(...args);
      } catch (error) {
        throw getQueryError(options, error);
      }
    },
  });

  return {
    ...query,
    updateAllSubQueries: (
      data: (
        currentValue: InfiniteData<TQueryFnData>
      ) => InfiniteData<TQueryFnData>
    ) => {
      updateAllQueryCache(options.queryKey, data);
    },
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  };
}

export type UseExtendInfiniteQueryOptions<TData> = Omit<
  UndefinedInitialDataInfiniteOptions<TData, Error>,
  'queryKey' | 'getNextPageParam' | 'initialPageParam'
>;

export type UseExtendQueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error>,
  'queryFn' | 'queryKey'
>;

function updateAllQueryCache<T>(key: QueryKey, data: (currentValue: T) => T) {
  const queryCache = queryClient.getQueryCache();

  queryCache.findAll({ queryKey: key, type: 'active' }).forEach(cache => {
    queryClient.setQueryData(cache.queryKey, data);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getQueryError(options: CustomOptions, error: any) {
  const isLicenseError = error?.response?.status === 402;
  const errorMessageByStatusCode =
    options.errorByStatusCode?.[error?.response?.status];

  const queryErrorTitle =
    errorMessageByStatusCode || options.defaultErrorMessage;
  let queryErrorMessage = '';

  if (isLicenseError && !errorMessageByStatusCode) {
    queryErrorMessage = appendContactSupport('License Required');
  } else {
    queryErrorMessage = appendContactSupport('');
  }

  return createError(queryErrorMessage, queryErrorTitle);
}

function appendContactSupport(error: string) {
  const support = 'Please contact support@praetorian.com.';

  return capitalize(
    error ? appendPeriodIfMissing(error) + ` ${support}` : support
  );
}

interface CustomOptions {
  defaultErrorMessage: string;
  errorByStatusCode?: Record<number, string>;
}

export function mergeJobStatus(
  jobStatus: (JobStatus | undefined)[]
): JobStatus | undefined {
  if (jobStatus.includes(JobStatus.Queued)) {
    return JobStatus.Queued;
  }
  if (jobStatus.includes(JobStatus.Running)) {
    return JobStatus.Running;
  }
  if (jobStatus.includes(JobStatus.Fail)) {
    return JobStatus.Fail;
  }
  if (jobStatus.includes(JobStatus.Pass)) {
    return JobStatus.Pass;
  }
  return undefined;
}

/**
 * This util combines status from multiple queries into one status
 * @param statusList List of QueryStatus
 * @returns
 */
export function mergeStatus(...statusList: QueryStatus[]): QueryStatus {
  let isError = false;
  let isLoading = false;

  statusList.forEach(s => {
    if (s === 'error') {
      isError = true;
    }
    if (s === 'pending') {
      isLoading = true;
    }
  });

  if (isError) {
    return 'error';
  } else if (isLoading) {
    return 'pending';
  }

  return 'success';
}

export function useMergeStatus(...statusList: QueryStatus[]): QueryStatus {
  return useMemo(
    () => mergeStatus(...statusList),
    [JSON.stringify(statusList)]
  );
}
