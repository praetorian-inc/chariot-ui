import { toast } from 'sonner';

import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { queryClient } from '@/queryclient';
import { Risk, RiskStatus, RiskTemplate } from '@/types';
import { useMutation } from '@/utils/api';

export const useCreateRisk = () => {
  const axios = useAxios();
  const { updateAllSubQueries } = useMy(
    {
      resource: 'risk',
    },
    {
      enabled: false,
    }
  );

  return useMutation<Risk, Error, RiskTemplate>({
    defaultErrorMessage: `Failed to create risk`,
    mutationFn: async riskTemplate => {
      const promise = axios.post('/risk', riskTemplate);

      toast.promise(promise, {
        loading: 'Creating risk...',
        success: 'Risk created',
        error: 'Failed to create risk',
      });
      const { data } = await promise;
      const newRisk = data.risks[0];
      updateAllSubQueries(previous => {
        const newPages = previous ? [...previous.pages] : [];
        newPages[0] = [newRisk, ...newPages[0]]; // Add the new risk to the first page

        return {
          pages: newPages,
          pageParams: [undefined],
        };
      });

      return newRisk;
    },
  });
};

interface RiskUpdate extends RiskTemplate {
  showSnackbar?: boolean;
}

export const useUpdateRisk = () => {
  const axios = useAxios();
  const { updateAllSubQueries } = useMy(
    {
      resource: 'risk',
    },
    {
      enabled: false,
    }
  );

  return useMutation<Risk, Error, RiskUpdate>({
    defaultErrorMessage: `Failed to update risk`,
    mutationFn: async riskUpdate => {
      const { showSnackbar = true, ...riskTemplate } = riskUpdate;
      const promise = axios.put('/risk', riskTemplate);

      if (showSnackbar) {
        toast.promise(promise, {
          loading: 'Updating risk...',
          success: 'Risk updated',
          error: 'Failed to update risk',
        });
      }

      const { data } = await promise;
      const updatedRisk = data.risks[0];

      queryClient.invalidateQueries({
        queryKey: getQueryKey.getCounts('risk'),
      });

      updateAllSubQueries(previous => {
        const updatedPages = previous.pages.map(page =>
          page.map(risk => (risk.key === updatedRisk.key ? updatedRisk : risk))
        );

        return { ...previous, pages: updatedPages };
      });

      return updatedRisk;
    },
  });
};

const useBulkUpdateRiskHook = () => {
  const axios = useAxios();
  const { updateAllSubQueries } = useMy(
    {
      resource: 'risk',
    },
    {
      enabled: false,
    }
  );

  return useMutation<unknown, Error, RiskTemplate[]>({
    defaultErrorMessage: 'Failed to update risks',
    mutationFn: async (risks: RiskTemplate[]) => {
      const promise = Promise.all(
        risks
          .map(async risk => await axios.put(`/risk`, risk))
          // Note: Catch error so we can continue updating risk even if some fail
          .map(p => p.catch(e => e))
      );

      toast.promise(promise, {
        loading: 'Updating risks...',
        success: 'Risks updated',
        error: 'Failed to update risks',
      });
      const response = await promise;

      const validResults = response.filter(
        result => !(result instanceof Error)
      );

      if (validResults.length > 0) {
        const keys = risks.map(r => r.key);

        updateAllSubQueries(previous => {
          const updatedPages = previous.pages.map(page =>
            page.map(risk =>
              keys.includes(risk.key)
                ? {
                    ...risk,
                    ...risks.find(r => r.key === risk.key),
                  }
                : risk
            )
          );

          return { ...previous, pages: updatedPages };
        });
      }

      if (validResults.length !== risks.length) {
        const firstError = response.find(result => result instanceof Error);

        throw firstError;
      }

      return;
    },
  });
};

export function useBulkUpdateRisk() {
  const { mutate: updateRisk, status } = useBulkUpdateRiskHook();

  function handleUpdate({
    selectedRows,
    status,
    severity,
    comment: newComment,
  }: {
    selectedRows: Risk[];
    status?: RiskStatus;
    severity?: string;
    comment?: string;
  }) {
    return updateRisk(
      selectedRows.map(item => {
        const riskComposite = item.key.split('#');
        const finding = riskComposite[3];
        let newStatus = item.status;
        if (status) {
          newStatus = `${status?.[0]}${newStatus?.[1]}${status?.[1] || ''}`;
        }
        if (severity) {
          newStatus = `${newStatus[0]}${severity}${newStatus?.[2] || ''}`;
        }
        return {
          key: item.key,
          name: finding,
          status: newStatus,
          comment: newComment || item.comment,
        };
      })
    );
  }

  return { handleUpdate, status };
}

interface ReportRiskProps {
  name: string;
}

export function useReportRisk() {
  const axios = useAxios();

  return useMutation<unknown, Error, ReportRiskProps>({
    defaultErrorMessage: `Failed to generate risk report`,
    mutationFn: async props => {
      const res = await axios.get('/report/risk', {
        params: {
          name: props.name,
        },
      });

      return res;
    },
    onSuccess: (_, props) => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey.getFile({ name: `definitions/${props.name}` }),
      });
    },
  });
}
