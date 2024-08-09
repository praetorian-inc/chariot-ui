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
        key: `#attribute#source##asset#${integration.member}`,
      },
    })) as { data: Statistics };

    // Extract the asset count from the `attributes` field with the new key structure
    const assetCount = data.attributes
      ? data.attributes[
          `#source##asset#${integration.member}#${integration.value ?? integration.member}#asset`
        ] || 0
      : 0;

    return assetCount;
  } catch (error) {
    console.error(`Failed to fetch counts for ${integration.member}:`, error);
    return 0; // Return 0 in case of an error
  }
};

const useIntegrationCounts = (integrations: Account[]) => {
  const axios = useAxios();

  const queries = integrations.map(integration => ({
    queryKey: ['integrationCount', integration.member, integration.value],
    queryFn: () => fetchIntegrationCounts(axios, integration),
    enabled: !!integration.member,
  }));

  const results = useQueries({ queries });

  return results;
};

export default useIntegrationCounts;
