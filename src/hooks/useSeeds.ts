import { Snackbar } from '@/components/Snackbar';
import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { queryClient } from '@/queryclient';
import { useAuth } from '@/state/auth';
import { Seed, SeedStatus } from '@/types';
import { useMutation } from '@/utils/api';

interface NewSeed {
  asset: string;
}

interface InfiniteQueryData {
  pages: Seed[][];
  pageParams: unknown[];
}

const stopMessage = 'Risk scanning will stop.';
export const startMessage = 'Risk scanning will start automatically.';

export const create = () => {
  const axios = useAxios();
  const queryKey = ['MY', 'seed'];
  const { invalidate: invalidateJob } = useMy(
    { resource: 'job' },
    { enabled: false }
  );

  return useMutation<Seed, Error, NewSeed>({
    defaultErrorMessage: `Failed to add seed`,
    errorByStatusCode: {
      402: 'License is required to add more seeds',
    },
    mutationFn: async (seed: NewSeed) => {
      const { data } = await axios.post(`/seed`, {
        dns: seed.asset,
        status: SeedStatus.Active,
      });

      Snackbar({
        title: `${seed.asset} added`,
        description: startMessage,
        variant: 'success',
      });

      invalidateJob();

      queryClient.setQueryData<InfiniteQueryData>(queryKey, previous => {
        // If there's no previous data, initialize with the new seed
        if (!previous) {
          return { pages: [[...data]], pageParams: [] };
        }

        const updatedPages = previous.pages.map((page, index) =>
          index === 0 ? [...data, ...page] : page
        );
        return { ...previous, pages: updatedPages };
      });

      return data;
    },
  });
};

interface ChangeStatus {
  key: string;
  status?: SeedStatus;
  comment?: string;
  showSnackbar?: boolean;
}
export const change = () => {
  const axios = useAxios();
  const { me } = useAuth();

  const { updateAllSubQueries } = useMy(
    {
      resource: 'seed',
    },
    {
      enabled: false,
    }
  );

  return useMutation<Seed, Error, ChangeStatus>({
    defaultErrorMessage: `Failed to update seed`,
    mutationFn: async ({ key, status, comment, showSnackbar = true }) => {
      const seed = key.split('#seed#')[1];
      const response = await axios.put(`/seed`, {
        key,
        status,
        comment,
      });

      const data = response.data?.[0] as Seed;

      if (!data.username) {
        data.username = me;
      }

      if (status && showSnackbar) {
        Snackbar({
          title: `${seed} ${status === SeedStatus.Frozen ? 'will be removed' : 'will resume scanning'}`,
          description:
            status === SeedStatus.Frozen ? stopMessage : startMessage,
          variant: 'success',
        });
      } else if (comment && showSnackbar) {
        Snackbar({
          title: `${seed} comment updated`,
          description: '',
          variant: 'success',
        });
      }

      updateAllSubQueries(previous => {
        if (!previous) {
          return { pages: [[data]], pageParams: [undefined] };
        }
        const updatedPages = previous.pages.map(page =>
          page.map(currentSeed =>
            currentSeed.key === key
              ? {
                  ...currentSeed,
                  ...data,
                  username: data.username || me,
                }
              : currentSeed
          )
        );
        return { ...previous, pages: updatedPages };
      });

      return data;
    },
  });
};

export function useDeleteSeed() {
  const axios = useAxios();
  const { updateAllSubQueries } = useMy(
    {
      resource: 'seed',
    },
    {
      enabled: false,
    }
  );

  return useMutation<void, Error, { seed: Seed; showSnackbar?: boolean }>({
    defaultErrorMessage: `Failed to delete seed`,
    mutationFn: async ({ seed }) => {
      await axios.delete(`/seed`, {
        data: {
          key: seed.key,
        },
      });
    },
    onSuccess: (_, { seed, showSnackbar = true }) => {
      showSnackbar &&
        Snackbar({
          title: `Seed ${seed.name} removed`,
          description: '',
          variant: 'success',
        });

      updateAllSubQueries(previous => {
        if (previous) {
          return {
            ...previous,
            pages: previous.pages.map(page =>
              page.filter(
                item => item.dns !== seed.dns || item.name !== seed.name
              )
            ),
          };
        }
        return previous;
      });
    },
  });
}

export const useBulkAddSeed = () => {
  const axios = useAxios();
  const { invalidate: invalidateJob } = useMy(
    { resource: 'job' },
    { enabled: false }
  );
  const { invalidate: invalidateSeed } = useMy(
    { resource: 'seed' },
    { enabled: false }
  );

  return useMutation<void, Error, NewSeed[]>({
    defaultErrorMessage: 'Failed to bulk add seed',
    errorByStatusCode: {
      402: 'License is required to add more seeds',
    },
    mutationFn: async (seeds: NewSeed[]) => {
      const response = await Promise.all(
        seeds
          .map(async seed => {
            await axios.post(`/seed`, {
              dns: seed.asset,
              status: SeedStatus.Active,
            });
          })
          // Note: Catch error so we can continue adding seeds even if some fail
          .map(p => p.catch(e => e))
      );

      const validResults = response.filter(
        result => !(result instanceof Error)
      );

      if (validResults.length > 0) {
        Snackbar({
          title: `Added ${validResults.length} seeds`,
          description: startMessage,
          variant: 'success',
        });

        invalidateJob();
        invalidateSeed();
      }

      if (validResults.length !== seeds.length) {
        const firstError = response.find(result => result instanceof Error);
        // Note: Some seeds failed to add, so throwing the first error, and useMutation will handle the error toast

        throw firstError;
      }

      return;
    },
  });
};
