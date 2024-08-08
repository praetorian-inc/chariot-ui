import { useCallback } from 'react';

import { useMy } from '@/hooks/useMy';
import { AvailableIntegrations } from '@/sections/overview/Integration';
import { Asset } from '@/types';

export const useIntegration = () => {
  const { data: accounts, status: accountStatus } = useMy({
    resource: 'account',
  });

  const integrationList = accounts.filter(account =>
    AvailableIntegrations.includes(account.member)
  );

  const isIntegration = useCallback(
    (asset: Asset) => {
      return integrationList.some(account => account.member === asset.dns);
    },
    [accountStatus]
  );

  const getMyIntegrations = useCallback(() => {
    return integrationList.filter(account => account.member !== 'hook');
  }, [accountStatus]);

  return {
    isIntegration,
    getMyIntegrations,
  };
};
