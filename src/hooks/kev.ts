// eslint-disable-next-line no-restricted-imports

import { useGenericSearch } from '@/hooks/useGenericSearch';

export function useGetKev() {
  const { data, status } = useGenericSearch({
    query: '#attribute#source#kev',
  });

  return {
    data: data?.attributes?.map(({ source }) => source),
    status,
  };
}
