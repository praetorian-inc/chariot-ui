import { Snackbar } from '@/components/Snackbar';
import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { useMutation } from '@/utils/api';

interface CreateReference {
  key: string;
  class: string;
  name: string;
}

export const useCreateReference = () => {
  const axios = useAxios();
  const { invalidate: invalidateReference } = useMy(
    { resource: 'ref' },
    { enabled: false }
  );

  return useMutation<void, Error, CreateReference>({
    defaultErrorMessage: `Failed to add Reference`,
    mutationFn: async ref => {
      const { data } = await axios.post(`/risk/reference`, ref);

      Snackbar({
        title: `${ref.name} added`,
        description: '',
        variant: 'success',
      });

      invalidateReference();

      return data;
    },
  });
};
