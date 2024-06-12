import { Snackbar } from '@/components/Snackbar';
import { useAuth } from '@/state/auth';
import { useMutation } from '@/utils/api';
import { AvailableIntegrations } from '@/utils/availableIntegrations';
import { getChariotWebhookURL } from '@/utils/integration.util';
import { capitalize } from '@/utils/text.util';

import { Account, LinkAccount } from '../types';

import { useAxios } from './useAxios';
import { useMy } from './useMy';

export const useModifyAccount = (
  action: 'link' | 'unlink' | 'updateSetting'
) => {
  const axios = useAxios();
  const { invalidate } = useMy({ resource: 'account' }, { enabled: false });
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

        invalidate();

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
        Snackbar({
          title: `${capitalize(snackbarTitle)} ${snackbarAction}`,
          description:
            username === 'hook'
              ? action === 'link'
                ? 'Webhook URL copied to clipboard.'
                : 'Webhook URL was destroyed.'
              : `Your ${snackbarTitle} has been successfully ${snackbarAction}.`,
          variant: 'success',
        });

        return data;
      } catch (error) {
        Snackbar({
          title: `Error ${action === 'link' ? 'connecting' : 'disconnecting'} account`,
          description: 'Please check your username and secret and try again.',
          variant: 'error',
        });
        throw error;
      }
    },
  });
};
