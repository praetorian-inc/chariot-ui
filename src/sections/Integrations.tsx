import { useCallback, useMemo, useState } from 'react';
import { MinusCircleIcon } from '@heroicons/react/24/outline';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { twMerge } from 'tailwind-merge';

import { Button } from '@/components/Button';
import { IntegrationModal } from '@/components/ui/IntegrationModal';
import { useModifyAccount, useMy } from '@/hooks';
import { partition } from '@/utils/array.util';
import {
  AvailableIntegrations,
  IntegrationMeta,
  IntegrationsMeta,
  isFutureIntegration,
} from '@/utils/availableIntegrations';

import { Account } from '../types';

function getButtonText(integration: IntegrationMeta) {
  const { name, connected, issue } = integration;
  if (connected) {
    return 'Disconnect';
  } else if (isFutureIntegration(name)) {
    return issue ? `Github #${issue}` : 'Coming soon';
  } else {
    return 'Connect';
  }
}

const Integrations: React.FC = () => {
  const { data: accounts, status: accountsStatus } = useMy({
    resource: 'account',
  });
  const { mutate: unlink, status: unlinkStatus } = useModifyAccount('unlink');
  const isLoading = [accountsStatus, unlinkStatus].includes('pending');

  const integrationList = useMemo(
    () =>
      partition(accounts as Account[], account =>
        AvailableIntegrations.includes(account.member)
      )[0],
    [accounts]
  );

  const [form, setForm] = useState<
    (IntegrationMeta & { connectedAccounts?: Account[] }) | undefined
  >(undefined);
  const [updateForm, setUpdateForm] = useState<boolean>(false);

  const resetForm = useCallback(() => {
    setForm(undefined);
    setUpdateForm(false);
  }, []);

  const handleCTA = useCallback(
    (integration: IntegrationMeta) => {
      const { issue, connected } = integration;
      if (issue) {
        window.open(
          `https://github.com/praetorian-inc/chariot-ui/issues/${issue}`,
          '_blank noreferrer noopener'
        );
      } else if (connected) {
        const accounts = integrationList.filter(
          account => account.member === integration.name
        );
        if (accounts.length > 0) {
          accounts.forEach(account =>
            unlink({
              username: account.member,
              member: account.member,
              config: account.config,
              value: account.value,
              key: account.key,
            })
          );
        }
      } else {
        setUpdateForm(false);
        setForm(integration);
      }
    },
    [integrationList, unlink]
  );

  return (
    <div className="flex size-full h-max flex-wrap justify-center gap-5 overflow-x-auto pb-4">
      {IntegrationsMeta.map(integrationMeta => {
        const connectedAccounts = integrationList.filter(
          account => account.member === integrationMeta.name
        );
        const integration = {
          ...integrationMeta,
          connected: connectedAccounts.length > 0,
        };

        return (
          <div
            key={integration.id}
            className="w-[302px] max-w-[302px] rounded-[2px] bg-layer0 shadow"
          >
            <div className="relative flex flex-col items-center p-8">
              <img
                src={integration.logo}
                alt={integration.name}
                className="h-32 p-10"
              />
              <h2
                className="mt-6 font-semibold
              "
              >
                {integration.displayName}
              </h2>
              <p className="mt-1 line-clamp-3 min-h-[72px] text-center text-default-light">
                {integration.description}
              </p>
            </div>
            <div className="flex w-full">
              {integration.connected && (
                <Button
                  className="grow basis-1/2 rounded-none rounded-bl-[2px] border-r-2 border-t-2 border-gray-100 bg-layer0 py-4"
                  onClick={() => {
                    setUpdateForm(true);
                    setForm({ ...integration, connectedAccounts });
                  }}
                >
                  Edit
                </Button>
              )}
              <Button
                className={twMerge(
                  'grow basis-1/2 py-4 bg-layer0 rounded-none border-t-2 border-gray-100',
                  integration.connected &&
                    'text-red-600 hover:text-red-500 rounded-br-[2px]',
                  !integration.connected &&
                    !isFutureIntegration(integration.name) &&
                    'text-brand hover:text-brand-hover'
                )}
                startIcon={
                  integration.connected ? (
                    <MinusCircleIcon className="mr-2 size-5" />
                  ) : !isFutureIntegration(integration.name) ? (
                    <PlusCircleIcon className="mr-2 size-5" />
                  ) : undefined
                }
                onClick={() => handleCTA(integration)}
              >
                {isLoading ? 'Loading...' : getButtonText(integration)}
              </Button>
            </div>
          </div>
        );
      })}
      {form && (
        <IntegrationModal
          form={form}
          updateForm={updateForm}
          onClose={resetForm}
        />
      )}
    </div>
  );
};

export default Integrations;
