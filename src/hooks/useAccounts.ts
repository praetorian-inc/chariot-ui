import { useMemo } from 'react';
import { toast } from 'sonner';

import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { AvailableIntegrations } from '@/sections/overview/Integration';
import { useAuth } from '@/state/auth';
import { Account, LinkAccount } from '@/types';
import { useMutation } from '@/utils/api';
import { getChariotWebhookURL } from '@/utils/integration.util';
import { capitalize } from '@/utils/lodash.util';

export const useModifyAccount = (
  action: 'link' | 'unlink' | 'updateSetting'
) => {
  const axios = useAxios();
  const { invalidate: invalidateAccount } = useMy(
    { resource: 'account' },
    { enabled: false }
  );
  const { invalidate: invalidateAsset } = useMy(
    { resource: 'asset' },
    { enabled: false }
  );
  const { me, api } = useAuth();

  return useMutation<Account, Error, LinkAccount>({
    defaultErrorMessage: 'Failed to modify account',
    mutationFn: async account => {
      try {
        const {
          username,
          config: configAccount,
          member,
          value,
          key,
          ...rest
        } = account;
        const config =
          configAccount || (Object.keys(rest).length ? rest : null);
        let data: Account;
        if (action === 'link' || action === 'updateSetting') {
          const response = await axios.post(`/account/${username}`, {
            config,
            value,
          });
          data = response.data as Account;
        } else {
          const response = await axios.delete(`/account/${username}`, {
            data: {
              config: configAccount,
              member,
              value,
              key,
            },
          });
          data = response.data as Account;
        }

        invalidateAccount();
        invalidateAsset();

        const snackbarTitle = AvailableIntegrations.includes(username)
          ? 'integration'
          : 'account';

        const snackbarAction =
          action === 'link'
            ? 'connected'
            : action === 'updateSetting'
              ? 'updated'
              : 'disconnected';

        if (action === 'link' && username === 'hook') {
          const webhookUrl = getChariotWebhookURL({
            api,
            me,
            pin: data.config.pin,
          });
          navigator.clipboard.writeText(webhookUrl);
        }

        // Show success snackbar
        toast.success(`${capitalize(snackbarTitle)} ${snackbarAction}`, {
          description:
            username === 'hook'
              ? action === 'link'
                ? 'Webhook URL copied to clipboard.'
                : 'Webhook URL was destroyed.'
              : `Your ${snackbarTitle} has been successfully ${snackbarAction}.`,
        });

        return data;
      } catch (error) {
        toast.error(
          `Error ${action === 'link' ? 'connecting' : 'disconnecting'} account`,
          {
            description: 'Please check your username and secret and try again.',
          }
        );
        throw error;
      }
    },
  });
};

export function usePurgeAccount() {
  const axios = useAxios();
  const { logout } = useAuth();

  return useMutation<null, Error, void>({
    defaultErrorMessage: `Failed to purge account`,
    mutationFn: async () => {
      try {
        await axios.delete(`/account/purge`);
        logout();
      } catch {
        // ignore
      }
      return null;
    },
  });
}

export function useGetDisplayName(accounts: Account[]) {
  return useMemo(() => getDisplayName(accounts), [JSON.stringify(accounts)]);
}

export function getDisplayName(accounts: Account[]) {
  const myAccount = accounts?.find(acc => acc.key.endsWith('#settings#'));

  return myAccount?.config?.displayName || '';
}

export function useGetCollaboratorEmails(accounts: Account[]) {
  return useMemo(() => {
    return accounts
      .filter(
        acc => !acc.key.endsWith('#settings#') && acc?.member === acc?.username
      )
      .map(acc => acc.name);
  }, [JSON.stringify(accounts)]);
}
