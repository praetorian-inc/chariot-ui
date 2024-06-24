import { Snackbar } from '@/components/Snackbar';
import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { queryClient } from '@/queryclient';
import { Risk, RiskTemplate } from '@/types';
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
