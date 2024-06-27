import { Snackbar } from '@/components/Snackbar';
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
      const { data } = await axios.post('/risk', riskTemplate);
      const newRisk = data.risks[0];

      Snackbar({
        title: 'Risk Created',
        description: 'A new risk has been successfully created.',
        variant: 'success',
      });

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
      const { data } = await axios.put('/risk', riskTemplate);
      const updatedRisk = data.risks[0];

      queryClient.invalidateQueries({
        queryKey: getQueryKey.getCounts('risk'),
      });

      showSnackbar &&
        Snackbar({
          title: 'Risk Updated',
          description: 'The risk has been successfully updated.',
          variant: 'success',
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
    defaultErrorMessage: 'Failed to bulk update risks',
    mutationFn: async (risks: RiskTemplate[]) => {
      const response = await Promise.all(
        risks
          .map(async risk => await axios.post(`/risk`, risk))
          // Note: Catch error so we can continue updating risk even if some fail
          .map(p => p.catch(e => e))
      );

      const validResults = response.filter(
        result => !(result instanceof Error)
      );

      if (validResults.length > 0) {
        Snackbar({
          title: `${risks.length} Risks Updated`,
          description: 'The risk has been successfully updated.',
          variant: 'success',
        });

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
        // Note: Some seeds failed to add, so throwing the first error, and useMutation will handle the error toast

        throw firstError;
      }

      return;
    },
  });
};

export function useBulkUpdateRisk() {
  const { mutate: updateRisk } = useBulkUpdateRiskHook();

  function handleUpdate({
    selectedRows,
    status,
    severity,
  }: {
    selectedRows: Risk[];
    status?: RiskStatus;
    severity?: string;
  }) {
    updateRisk(
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
          comment: item.comment,
        };
      })
    );
  }

  return handleUpdate;
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
