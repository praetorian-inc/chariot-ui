import { useCallback } from 'react';

import { useMy } from '@/hooks/useMy';
import { Asset } from '@/types';
import { AvailableIntegrations } from '@/utils/availableIntegrations';

export const useIntegration = () => {
  const { data: accounts, status: accountStatus } = useMy({
    resource: 'account',
  });

  const integrationList = accounts.filter(account =>
    AvailableIntegrations.includes(account.member)
  );

  const isIntegration = useCallback(
    (asset: Asset) => {
      return (
        asset.seed &&
        integrationList.some(account => account.member === asset.dns)
      );
    },
    [accountStatus]
  );

  const isIntegrationConnected = useCallback(
    (name: string) => {
      return accounts.map(({ member }) => member).includes(name);
    },
    [accounts]
  );

  const getConnectedIntegration = useCallback(
    (name: string) => {
      return isIntegrationConnected(name)
        ? accounts.filter(({ member }) => member === name)
        : [];
    },
    [accounts]
  );

  return {
    isIntegration,
    isIntegrationConnected,
    getConnectedIntegration,
  };
};
