// eslint-disable-next-line no-restricted-imports
import { useQueries } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';

import { useAxios } from '@/hooks/useAxios';
import { Account, Statistics } from '@/types';

const fetchIntegrationCounts = async (
  axios: AxiosInstance,
  integration: Account
) => {
  try {
    const { data } = (await axios.get('/my/count', {
      params: {
        key: `dns:${integration.member}`,
      },
    })) as { data: Statistics };

    // Sum up all the values in the `status` field
    const totalStatusCount = Object.values(data.status || {}).reduce(
      (acc, count) => acc + count,
      0
    );

    return totalStatusCount;
  } catch (error) {
    console.error(`Failed to fetch counts for ${integration.name}:`, error);
    return 0; // Return 0 in case of an error
  }
};

const useIntegrationCounts = (integrations: Account[]) => {
  const axios = useAxios();

  const queries = integrations.map(integration => ({
    queryKey: ['integrationCount', integration.member],
    queryFn: () => fetchIntegrationCounts(axios, integration),
    enabled: !!integration.member,
  }));

  const results = useQueries({ queries });

  return results;
};

export default useIntegrationCounts;
