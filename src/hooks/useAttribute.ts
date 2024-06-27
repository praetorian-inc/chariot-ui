import { Snackbar } from '@/components/Snackbar';
import { useAxios } from '@/hooks/useAxios';
import { useMy } from '@/hooks/useMy';
import { useMutation } from '@/utils/api';

interface CreateAttribute {
  key: string;
  class: string;
  name: string;
}

export const useCreateAttribute = () => {
  const axios = useAxios();
  const { invalidate: invalidateReference } = useMy(
    { resource: 'attribute' },
    { enabled: false }
  );

  return useMutation<void, Error, CreateAttribute>({
    defaultErrorMessage: `Failed to add attribute`,
    mutationFn: async attribute => {
      const { data } = await axios.post(`/asset/attribute`, attribute);

      Snackbar({
        title: `${attribute.name} added`,
        description: '',
        variant: 'success',
      });

      invalidateReference();

      return data;
    },
  });
};
