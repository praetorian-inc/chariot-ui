// eslint-disable-next-line no-restricted-imports
import { useQueries } from '@tanstack/react-query';

import { Snackbar } from '@/components/Snackbar';
import { useAxios } from '@/hooks/useAxios';
import { useCounts } from '@/hooks/useCounts';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { getQueryKey } from '@/hooks/useQueryKeys';
import { Attribute } from '@/types';
import { mergeStatus, useMutation } from '@/utils/api';

interface CreateAttribute {
  key: string;
  class: string;
  name: string;
}

export const useCreateAttribute = (resourceKey = '') => {
  const axios = useAxios();
  const { invalidate: invalidateAttributeCounts } = useCounts(
    { resource: 'attribute' },
    { enabled: false }
  );
  const { invalidate: invalidateAttributesGenericSearch } = useGenericSearch(
    {
      query: `source:${resourceKey}`,
    },
    {
      enabled: false,
    }
  );

  return useMutation<void, Error, CreateAttribute>({
    defaultErrorMessage: `Failed to add attribute`,
    mutationFn: async attribute => {
      const { data } = await axios.post(`/attribute`, {
        key: attribute.key,
        name: attribute.class,
        value: attribute.name,
      });

      Snackbar({
        title: `Attribute added`,
        description: '',
        variant: 'success',
      });

      invalidateAttributeCounts();
      invalidateAttributesGenericSearch();

      return data;
    },
  });
};

export const useAssetsWithAttributes = (attributes: string[]) => {
  const axios = useAxios();
  return useQueries({
    queries: attributes
      .filter(x => Boolean(x))
      .map(attribute => {
        return {
          queryKey: getQueryKey.getMy('attribute', `#${attribute}`),
          queryFn: async () => {
            const res = await axios.get(`/my`, {
              params: {
                key: `#attribute#${attribute}`,
              },
            });

            return res.data['attributes'] as Attribute[];
          },
        };
      }),
    combine: results => {
      return {
        data: results
          .filter(x => x)
          .reduce((acc, result) => {
            const currentSources = (result.data || []).map(
              (attribute: Attribute) => attribute.source
            );
            return acc.length === 0
              ? currentSources
              : [...new Set([...acc, ...currentSources])];
          }, [] as string[]),
        status: mergeStatus(...results.map(result => result.status)),
      };
    },
  });
};
