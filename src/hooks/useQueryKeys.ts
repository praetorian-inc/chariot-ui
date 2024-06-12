import { MyResourceKey, UniqueQueryKeys } from '../types';

import { GetFilesProps } from './useFiles';

export const getQueryKey = {
  getMy: (key: MyResourceKey, compositeKey?: string) => {
    return [UniqueQueryKeys.MY, key, ...(compositeKey ? [compositeKey] : [])];
  },
  getBackend: () => [UniqueQueryKeys.Backends],
  getFile: (props: GetFilesProps) => [UniqueQueryKeys.GET_FILE, props.name],
  genericSearch: (search: string) => [
    UniqueQueryKeys.GENERIC_MY_SEARCH,
    search,
  ],
  getCounts: (resource: MyResourceKey, compositeKey?: string) => [
    UniqueQueryKeys.COUNTS,
    resource,
    ...(compositeKey ? [compositeKey] : []),
  ],
};
