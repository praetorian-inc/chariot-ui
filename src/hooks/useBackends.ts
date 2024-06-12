import { ConfigIniParser } from 'config-ini-parser';

import { useQuery } from '@/utils/api';

import { BackendSections } from '../types';

import { getQueryKey } from './useQueryKeys';

export const useBackends = () => {
  const configIniParser = new ConfigIniParser();
  return useQuery({
    defaultErrorMessage: 'Failed to fetch Backend',
    queryKey: getQueryKey.getBackend(),
    queryFn: async () => {
      const response = await fetch('/keychain.ini')
        .then(response => response.text())
        .then(data => {
          const parsedData = configIniParser.parse(data);
          const sections = parsedData.sections();
          const parsedSectionsData = sections.reduce((acc, section) => {
            return {
              ...acc,
              [section]: parsedData
                .items(section)
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
            };
          }, {});
          return parsedSectionsData;
        });

      return response as BackendSections;
    },
    enabled: true,
    refetchOnWindowFocus: false, // This is stored on the file system, so no need to refetch
    staleTime: Infinity,
  });
};
