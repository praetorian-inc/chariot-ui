import { useEffect, useState } from 'react';

import { getDisplayName, useGetCollaboratorEmails } from '@/hooks/useAccounts';
import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { useAuth } from '@/state/auth';
import { Account, Statistics } from '@/types';
import { QueryStatus, useMergeStatus } from '@/utils/api';

interface Collaborator {
  email: string;
  displayName: string;
  counts?: Statistics;
}

interface CollaboratorProps {
  getRiskCounts?: boolean;
  doNotImpersonate?: boolean;
}

export function useGetCollaborators(props?: CollaboratorProps) {
  const { getToken } = useAuth();

  const axios = useAxios();

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaboratorsStatus, setCollaboratorsStatus] =
    useState<QueryStatus>('pending');

  const { data: accounts, status: accountsStatus } = useMy(
    {
      resource: 'account',
    },
    { doNotImpersonate: props?.doNotImpersonate }
  );

  const collaboratorEmails = useGetCollaboratorEmails(accounts);

  useEffect(() => {
    const fetchCollaboratorsOrgName = async () => {
      setCollaboratorsStatus('pending');

      const requests = collaboratorEmails.map(
        async (email): Promise<Collaborator> => {
          const token = await getToken();

          const promises = [
            axios<{ accounts: Account[] }>({
              method: 'get',
              url: `/my?key=${encodeURIComponent('#account')}`,
              headers: {
                Authorization: token ? `Bearer ${token}` : '',
                account: email,
              },
            }).then(response => response.data.accounts),
            props?.getRiskCounts
              ? axios<Statistics>({
                  method: 'get',
                  url: `/my/count?key=${encodeURIComponent('#risk')}`,
                  headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    account: email,
                  },
                }).then(response => response.data)
              : undefined,
          ] as const;

          const [accountsResponse, counts] = await Promise.all(promises);

          const friendDisplayName = getDisplayName(accountsResponse);

          return {
            displayName: friendDisplayName,
            email,
            counts,
          };
        }
      );

      // Silence Error and display results that
      const results = await Promise.all(requests.map(p => p.catch(e => e)));
      const hasSomeError = results.find(r => r instanceof Error);

      setCollaborators(
        hasSomeError ? results.filter(s => s && !(s instanceof Error)) : results
      );

      setCollaboratorsStatus('success');
    };

    if (collaboratorEmails.length > 0) {
      fetchCollaboratorsOrgName();
    } else {
      setCollaborators([]);
      setCollaboratorsStatus('success');
    }
  }, [JSON.stringify(collaboratorEmails)]);

  return {
    data: collaborators,
    status: useMergeStatus(collaboratorsStatus, accountsStatus),
  };
}
